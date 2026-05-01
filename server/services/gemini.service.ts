import { Logger } from "borgen";
import { ENV } from "../lib/environments";
import { MASTER_SCREENING_PROMPT, CANDIDATE_EMAIL_PROMPT } from "../lib/prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

export class GeminiService {
  private static model = genAI.getGenerativeModel({ model: ENV.GEMINI_MODEL });
  private static CHUNK_SIZE = 10;
  private static MAX_RETRIES = 3;

  /**
   * Evaluates a large batch of candidates by splitting them into chunks with retries
   */
  static async evaluateCandidates(
    job: any, 
    candidates: any[], 
    onProgress?: (results: any[]) => Promise<void>,
    message?: string
  ): Promise<any[]> {
    const chunks = this.createChunks(candidates, this.CHUNK_SIZE);
    let allResults: any[] = [];

    Logger.info({ message: `Evaluating ${candidates.length} candidates in ${chunks.length} chunks...` });

    // Process chunks sequentially to respect rate limits, but with retries per chunk
    for (const [index, chunk] of chunks.entries()) {
      let retryCount = 0;
      let success = false;
      let lastError: any = null;

      while (retryCount < this.MAX_RETRIES && !success) {
        try {
          // Add a small delay between chunks to prevent rate limit issues
          if (index > 0 && retryCount === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          const prompt = this.constructScreeningPrompt(job, chunk, message);
          const result = await this.model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          const cleanedJson = this.extractJson(text);
          const parsedResults = JSON.parse(cleanedJson);

          if (Array.isArray(parsedResults)) {
            allResults = [...allResults, ...parsedResults];
            success = true;
            
            // Call onProgress if provided
            if (onProgress) {
              await onProgress(allResults);
            }
          } else {
            throw new Error("Invalid JSON format from AI: Expected an array");
          }
        } catch (error) {
          retryCount++;
          lastError = error;
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff (2s, 4s, 8s)
          
          Logger.warn({ 
            message: `Chunk ${index + 1} failed (Attempt ${retryCount}). Retrying in ${delay}ms... Error: ${error}` 
          });

          if (retryCount < this.MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      if (!success) {
        Logger.error({ message: `Chunk ${index + 1} failed after ${this.MAX_RETRIES} attempts. Stopping screening.` });
        throw new Error(`Failed to evaluate candidate chunk ${index + 1}: ${lastError?.message || 'Unknown error'}`);
      }
    }

    // After all chunks are processed (or skipped), sort globally by matchScore
    const sortedResults = allResults.sort((a, b) => b.matchScore - a.matchScore);
    
    // Final check: Re-assign ranks based on global sorted order
    return sortedResults.map((result, index) => ({
      ...result,
      rank: index + 1
    }));
  }

  /**
   * Helper to split array into chunks
   */
  private static createChunks(array: any[], size: number): any[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Construct the master screening prompt using the external template
   */
  private static constructScreeningPrompt(job: any, candidates: any[], message?: string): string {
    const jobData = JSON.stringify({
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills,
      experienceLevel: job.experienceLevel,
      type: job.type,
      location: job.location,
      analysisWeights: job.analysisWeights,
    });

    const candidateData = JSON.stringify(
      candidates.map((c) => ({
        id: c._id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        skills: c.skills,
        experience: c.experience,
        education: c.education,
        bio: c.bio,
        headline: c.headline,
      }))
    );

    let prompt = MASTER_SCREENING_PROMPT
      .replace("{{JOB_DATA}}", jobData)
      .replace("{{CANDIDATE_DATA}}", candidateData);

    if (message) {
      prompt = prompt.replace("{{RE_EVALUATION_FOCUS}}", `- RE_EVALUATION_FOCUS: The user requested the following specific focus for this re-evaluation: "${message}". Please weigh this heavily in your analysis.`);
    } else {
      prompt = prompt.replace("{{RE_EVALUATION_FOCUS}}", "");
    }

    return prompt;
  }

  /**
   * Evaluate job creation chat history
   */
  static async evaluateJobCreationChat(
    messages: { role: string; content: string }[],
    availableLocations: any[] = [],
    availableDepartments: any[] = []
  ): Promise<any> {
    const locationsStr = availableLocations.map(l => `- ID: ${l._id}, Name: ${l.city}, ${l.country} (${l.workspaceType})`).join('\n');
    const departmentsStr = availableDepartments.map(d => `- ID: ${d._id}, Name: ${d.name}`).join('\n');

    const systemPrompt = `You are an expert technical recruiter assistant helping a user create a new job posting.
Your goal is to collect the following required fields from the user through a natural conversation:
1. title (string)
2. description (string - a detailed, professional job description generated in MARKDOWN format from the user's brief overview)
3. requiredSkills (array of strings)
4. experienceLevel (must be one of: "Entry", "Junior", "Mid", "Senior", "Lead")
5. type (must be one of: "Full-time", "Part-time", "Contract")
6. locationId (string - MUST be an ID from the available locations list)
7. departmentId (string - MUST be an ID from the available departments list)

Available Locations:
${locationsStr || 'None available'}

Available Departments:
${departmentsStr || 'None available'}

The conversation history will be provided. 

CRITICAL INSTRUCTIONS:
- You MUST return a "jobData" object in EVERY response.
- AGGRESSIVELY extract partial information (e.g. if the user says "I need a React dev", set "title" to "React Developer" and add "React" to "requiredSkills").
- For the "description" field: Ask the user for a brief overview. Once provided, you MUST GENERATE A FULL, DETAILED JOB DESCRIPTION IN MARKDOWN FORMAT. DO NOT just copy the user's input. Expand it to include standard sections like "About the Role", "Key Responsibilities", and "Qualifications" based on the title and skills. Use proper markdown headers, bullet points, and bold text for readability.
- NEVER GUESS or auto-fill "locationId" or "departmentId" just because the user mentions a location or department name.
- DO NOT GUESS or auto-fill "type", "experienceLevel", or "workspaceType". 
- IF ANY OF THE FOLLOWING ARE MISSING, YOU MUST SET "actionRequired" TO THE CORRESPONDING STRING SO THE UI CAN DISPLAY A SELECTOR:
  * If "type" is missing -> set "actionRequired" to "employmentType"
  * If "experienceLevel" is missing -> set "actionRequired" to "experienceLevel"
  * If "workspaceType" is missing -> set "actionRequired" to "workspaceType"
  * If "locationId" is missing -> set "actionRequired" to "location"
  * If "departmentId" is missing -> set "actionRequired" to "department"
- DO NOT JUST ASK THE USER VERBALLY FOR THESE FIELDS WITHOUT SETTING "actionRequired". YOU MUST SET IT.
- You can only set ONE "actionRequired" at a time. If multiple are missing, just pick one to ask for next.
- When the user selects an option from the UI, the system will send a message like "Selected location: Kigali, Rwanda (ID: 123)", "Selected employmentType: Full-time (ID: Full-time)", etc. ONLY THEN should you extract the ID and put it in the corresponding field ("locationId", "departmentId", "type", "experienceLevel"). 
- For "workspaceType", if the user selects it via the UI, use it to help filter or confirm the "locationId" they will select next, as workspace type is a property of the location.
- For "requiredSkills", always return an array of strings.

You MUST respond in pure JSON format (no markdown, no backticks) with this structure:
{
  "isComplete": boolean, // true ONLY if ALL 7 required fields are gathered and valid
  "nextQuestion": "string", // Friendly conversational question asking for missing details, or instructing them to use the selector
  "actionRequired": "location" | "department" | "employmentType" | "workspaceType" | "experienceLevel" | null, // MUST BE SET to trigger the UI modal if those IDs/values are missing.
  "jobData": {
    "title": "string or null",
    "description": "string or null",
    "requiredSkills": ["string"] or null,
    "experienceLevel": "string or null",
    "type": "string or null",
    "locationId": "string or null",
    "departmentId": "string or null"
  }
}

Conversation History:
${JSON.stringify(messages, null, 2)}`;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      const cleanedJson = this.extractJson(text);
      return JSON.parse(cleanedJson);
    } catch (error) {
      Logger.error({ message: "Error in evaluateJobCreationChat: " + error });
      throw new Error("Failed to evaluate chat with AI");
    }
  }

  /**
   * Extract JSON from a potentially markdown-wrapped string
   */
  private static extractJson(text: string): string {
    // 1. Remove markdown code block markers if present (```json or ```)
    let cleaned = text.replace(/```json\s?|```\s?/g, '');
    
    // 2. Find the first occurrence of [ or { and the last occurrence of ] or }
    const match = cleaned.match(/(\[[\s\S]*\]|{[\s\S]*})/);
    if (match) {
      return match[0];
    }
    return cleaned.trim();
  }

  /**
   * Generates a personalized email for a candidate
   */
  static async generateCandidateEmail(job: any, candidate: any): Promise<string> {
    const jobData = JSON.stringify({
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills,
    });

    const candidateData = JSON.stringify({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      skills: candidate.skills,
      experience: candidate.experience,
      headline: candidate.headline,
    });

    const prompt = CANDIDATE_EMAIL_PROMPT
      .replace("{{JOB_DATA}}", jobData)
      .replace("{{CANDIDATE_DATA}}", candidateData);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      Logger.error({ message: "Error in generateCandidateEmail: " + error });
      throw new Error("Failed to generate email with AI");
    }
  }
}
