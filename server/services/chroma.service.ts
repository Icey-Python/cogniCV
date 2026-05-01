import { Logger } from "borgen";
import { ENV } from "../lib/environments";
import { ChromaClient } from "chromadb";
import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import Job from "../models/job.model";
import ScreeningResult from "../models/screening.model";

// ─── Constants ───────────────────────────────────────────────────────────────

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;
const TOP_K = 8;

// ─── Clients ─────────────────────────────────────────────────────────────────

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
const chatModel = genAI.getGenerativeModel({ model: ENV.GEMINI_MODEL });

let chromaClient: ChromaClient | null = null;

function getChromaClient(): ChromaClient {
  if (!chromaClient) {
    const url = new URL(ENV.CHROMA_URL);
    chromaClient = new ChromaClient({
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : (url.protocol === "https:" ? 443 : 8000),
      ssl: url.protocol === "https:",
    });
  }
  return chromaClient;
}

// ─── Embedding Helpers ───────────────────────────────────────────────────────

async function embedTexts(
  texts: string[],
  taskType: TaskType
): Promise<number[][]> {
  const embeddings: number[][] = [];

  // Process in batches of 100 (Gemini batch limit)
  for (let i = 0; i < texts.length; i += 100) {
    const batch = texts.slice(i, i + 100);

    const result = await embeddingModel.batchEmbedContents({
      requests: batch.map((text) => ({
        content: { parts: [{ text }], role: "user" },
        taskType,
        outputDimensionality: EMBEDDING_DIMENSIONS,
      })),
    });

    for (const emb of result.embeddings) {
      embeddings.push(emb.values);
    }
  }

  return embeddings;
}

// ─── Document Chunking ───────────────────────────────────────────────────────

interface DocChunk {
  id: string;
  text: string;
  metadata: Record<string, string>;
}

function buildJobAnalysisDocuments(job: any, screening: any): DocChunk[] {
  const chunks: DocChunk[] = [];
  const jobId = job._id.toString();

  // 1. Job Overview Chunk
  const jobOverview = [
    `JOB POSTING: ${job.title}`,
    `Experience Level: ${job.experienceLevel}`,
    `Type: ${job.type}`,
    `Location: ${job.location?.city}, ${job.location?.country} (${job.location?.workspaceType})`,
    `Required Skills: ${job.requiredSkills.join(", ")}`,
    `Description: ${job.description}`,
  ].join("\n");

  chunks.push({
    id: `${jobId}_job_overview`,
    text: jobOverview,
    metadata: { jobId, chunkType: "job_overview" },
  });

  // 2. Per-Candidate Detail Chunks
  const ranked = screening.rankedCandidates || [];
  for (const candidate of ranked) {
    const p = candidate.profileSnapshot || {};
    const name = `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Unknown";
    const candidateId = candidate.candidateId?.toString() || "unknown";

    const skillsSummary = (p.skills || [])
      .map((s: any) => `${s.name} (${s.level}, ${s.yearsOfExperience}yr)`)
      .join(", ");

    const expSummary = (p.experience || [])
      .map(
        (e: any) =>
          `${e.role} at ${e.company} (${e.startDate}-${e.isCurrent ? "Present" : e.endDate || ""})`
      )
      .join("; ");

    const text = [
      `CANDIDATE: ${name}`,
      `Rank: #${candidate.rank} out of ${ranked.length}`,
      `Overall Match Score: ${candidate.matchScore}/100`,
      `Sub-Scores:`,
      `  - Skills: ${candidate.subScores?.skills ?? 0}/40`,
      `  - Experience: ${candidate.subScores?.experience ?? 0}/30`,
      `  - Education: ${candidate.subScores?.education ?? 0}/15`,
      `  - Relevance: ${candidate.subScores?.relevance ?? 0}/15`,
      `Profile Source: ${candidate.profileSource}`,
      `Headline: ${p.headline || "N/A"}`,
      `Location: ${p.location || "N/A"}`,
      `Skills: ${skillsSummary || "None listed"}`,
      `Experience: ${expSummary || "None listed"}`,
      `Strengths: ${(candidate.reasoning?.strengths || []).join("; ")}`,
      `Gaps/Risks: ${(candidate.reasoning?.gaps || []).join("; ")}`,
      `AI Recommendation: ${candidate.reasoning?.recommendation || "N/A"}`,
    ].join("\n");

    chunks.push({
      id: `${jobId}_candidate_${candidateId}`,
      text,
      metadata: { jobId, chunkType: "candidate_detail", candidateId },
    });
  }

  // 3. Ranking Summary Chunk (comparative view)
  const rankingRows = ranked.map(
    (c: any) =>
      `#${c.rank}. ${(c.profileSnapshot?.firstName || "")} ${(c.profileSnapshot?.lastName || "")} — Score: ${c.matchScore}/100 (Skills: ${c.subScores?.skills ?? 0}/40, Exp: ${c.subScores?.experience ?? 0}/30, Edu: ${c.subScores?.education ?? 0}/15, Rel: ${c.subScores?.relevance ?? 0}/15)`
  );

  const rankingSummary = [
    `COMPLETE RANKING SUMMARY FOR: ${job.title}`,
    `Total Candidates Evaluated: ${ranked.length}`,
    `Scoring System: Overall out of 100 (Skills/40 + Experience/30 + Education/15 + Relevance/15)`,
    "",
    ...rankingRows,
  ].join("\n");

  chunks.push({
    id: `${jobId}_ranking_summary`,
    text: rankingSummary,
    metadata: { jobId, chunkType: "ranking_summary" },
  });

  return chunks;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export class ChromaService {
  /**
   * Index a completed screening into ChromaDB.
   * Called by the embedding generation worker after screening completes.
   */
  static async indexJobAnalysis(jobId: string): Promise<void> {
    const client = getChromaClient();
    const collectionName = `job_${jobId}`;

    Logger.info({ message: `[ChromaService] Indexing job analysis for ${jobId}...` });

    // Fetch data from MongoDB
    const job = await Job.findById(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    const screening = await ScreeningResult.findOne({ jobId, status: "completed" })
      .sort({ createdAt: -1 });
    if (!screening) throw new Error(`No completed screening found for job ${jobId}`);

    // Build document chunks
    const chunks = buildJobAnalysisDocuments(job, screening);

    if (chunks.length === 0) {
      Logger.warn({ message: `[ChromaService] No chunks to index for job ${jobId}` });
      return;
    }

    // Generate embeddings
    const texts = chunks.map((c) => c.text);
    const embeddings = await embedTexts(texts, TaskType.RETRIEVAL_DOCUMENT);

    // Delete existing collection if it exists (re-indexing scenario)
    try {
      await client.deleteCollection({ name: collectionName });
    } catch {
      // Collection doesn't exist yet, that's fine
    }

    // Create collection and add documents
    const collection = await client.getOrCreateCollection({
      name: collectionName,
      metadata: { description: `RAG index for job ${jobId}` },
    });

    await collection.add({
      ids: chunks.map((c) => c.id),
      documents: texts,
      embeddings,
      metadatas: chunks.map((c) => c.metadata),
    });

    Logger.info({
      message: `[ChromaService] Indexed ${chunks.length} chunks for job ${jobId}`,
    });
  }

  /**
   * Query the job analysis index with a recruiter's question.
   * Returns a generated answer grounded in the retrieved context.
   */
  static async queryJobAnalysis(
    jobId: string,
    question: string,
    history: { role: string; content: string }[] = [],
    format: "markdown" | "mrkdwn" = "markdown"
  ): Promise<string> {
    const client = getChromaClient();
    const collectionName = `job_${jobId}`;

    // 1. Embed the query
    const [queryEmbedding] = await embedTexts([question], TaskType.RETRIEVAL_QUERY);

    // 2. Retrieve relevant chunks from ChromaDB
    let collection;
    try {
      collection = await client.getCollection({ name: collectionName });
    } catch {
      return "I don't have analysis data for this job yet. Please run the AI screening first, and the knowledge base will be built automatically.";
    }

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: TOP_K,
    });

    const retrievedDocs = (results.documents?.[0] || []).filter(Boolean);

    if (retrievedDocs.length === 0) {
      return "I couldn't find relevant information to answer your question. The analysis data may still be indexing.";
    }

    // 3. Build the RAG prompt
    const contextBlock = retrievedDocs
      .map((doc, i) => `--- Document ${i + 1} ---\n${doc}`)
      .join("\n\n");

    const conversationHistory = history
      .slice(-6) // Keep last 6 turns for context
      .map((m) => `${m.role === "user" ? "Recruiter" : "Assistant"}: ${m.content}`)
      .join("\n");

    const systemPrompt = `You are an expert AI recruitment analyst for the cogniCV platform. 
You have access to detailed screening analysis data for a specific job posting and its candidates.

Your role is to help recruiters understand their screening results by answering questions about:
- Why candidates are ranked in a specific order
- Individual candidate strengths, weaknesses, and scores
- Comparisons between candidates
- Score breakdowns and what they mean
- Hiring recommendations

RETRIEVED CONTEXT (from the job's analysis database):
${contextBlock}

${conversationHistory ? `CONVERSATION HISTORY:\n${conversationHistory}\n` : ""}

CRITICAL RULES:
1. ONLY answer based on the retrieved context above. Do NOT invent information.
2. Reference specific data points (scores, skills, experience) in your answers.
3. Be concise but thorough. Use bullet points for comparisons.
4. If the context doesn't contain enough information to answer, say so clearly.
5. Maintain a professional, analytical tone appropriate for a recruiter audience.
6. When comparing candidates, always cite their specific scores and reasoning.

FORMATTING RULES:
${format === "mrkdwn" ? `
- Use Slack's mrkdwn syntax:
  - Use *text* for BOLD (NOT **text**)
  - Use _text_ for ITALIC
  - Use ~text~ for STRIKETHROUGH
  - Use <url|text> for LINKS (NOT [text](url))
  - Use bullet points and code blocks as usual.
` : `
- Use standard Markdown syntax (**bold**, [link](url), etc.).
`}

Recruiter's Question: ${question}`;

    // 4. Generate answer using Gemini
    const result = await chatModel.generateContent(systemPrompt);
    const response = result.response;
    return response.text();
  }

  /**
   * Index a job summary into a global "job_discovery" collection for RAG-based search.
   */
  static async indexJobForDiscovery(jobId: string): Promise<void> {
    const client = getChromaClient();
    const collectionName = "job_discovery";

    const job = await Job.findById(jobId);
    if (!job) return;

    const collection = await client.getOrCreateCollection({
      name: collectionName,
      metadata: { description: "Global index for job discovery" },
    });

    const text = `JOB: ${job.title}\nLevel: ${job.experienceLevel}\nType: ${job.type}\nLocation: ${job.location.city}, ${job.location.country}\nRequired Skills: ${job.requiredSkills.join(", ")}\nDescription: ${job.description}`;
    const [embedding] = await embedTexts([text], TaskType.RETRIEVAL_DOCUMENT);

    await collection.upsert({
      ids: [jobId.toString()],
      documents: [text],
      embeddings: [embedding],
      metadatas: [{ jobId: jobId.toString(), title: job.title }],
    });

    Logger.info({ message: `[ChromaService] Indexed job ${jobId} for discovery` });
  }

  /**
   * Search for relevant jobs based on a natural language query.
   */
  static async searchJobs(query: string, limit: number = 3): Promise<{ jobId: string; title: string }[]> {
    const client = getChromaClient();
    const collectionName = "job_discovery";

    try {
      const collection = await client.getCollection({ name: collectionName });
      const [queryEmbedding] = await embedTexts([query], TaskType.RETRIEVAL_QUERY);

      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
      });

      const metadatas = results.metadatas?.[0] || [];
      return metadatas.map((m: any) => ({
        jobId: m.jobId,
        title: m.title,
      }));
    } catch {
      // If collection doesn't exist, fall back to simple title search in MongoDB
      const jobs = await Job.find({ title: { $regex: query, $options: "i" } }).limit(limit);
      return jobs.map((j) => ({
        jobId: j._id.toString(),
        title: j.title,
      }));
    }
  }

  /**
   * Check if a job's analysis has been indexed in ChromaDB.
   */
  static async isJobIndexed(jobId: string): Promise<boolean> {
    const client = getChromaClient();
    const collectionName = `job_${jobId}`;

    try {
      const collection = await client.getCollection({ name: collectionName });
      const count = await collection.count();
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Delete a job's collection from ChromaDB (cleanup).
   */
  static async deleteJobCollection(jobId: string): Promise<void> {
    const client = getChromaClient();
    try {
      await client.deleteCollection({ name: `job_${jobId}` });
      Logger.info({ message: `[ChromaService] Deleted collection for job ${jobId}` });
    } catch {
      // Collection didn't exist
    }
  }
}
