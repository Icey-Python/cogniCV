import { Logger } from "borgen";
import { ENV } from "../lib/environments";
import { MASTER_SCREENING_PROMPT } from "../lib/prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

export class GeminiService {
  private static model = genAI.getGenerativeModel({ model: ENV.GEMINI_MODEL });
  private static CHUNK_SIZE = 20;
  private static MAX_RETRIES = 3;

  /**
   * Evaluates a large batch of candidates by splitting them into chunks with retries
   */
  static async evaluateCandidates(job: any, candidates: any[]): Promise<any[]> {
    const chunks = this.createChunks(candidates, this.CHUNK_SIZE);
    let allResults: any[] = [];

    Logger.info({ message: `Evaluating ${candidates.length} candidates in ${chunks.length} chunks...` });

    // Process chunks sequentially to respect rate limits, but with retries per chunk
    for (const [index, chunk] of chunks.entries()) {
      let retryCount = 0;
      let success = false;

      while (retryCount < this.MAX_RETRIES && !success) {
        try {
          const prompt = this.constructScreeningPrompt(job, chunk);
          const result = await this.model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          const cleanedJson = this.extractJson(text);
          const parsedResults = JSON.parse(cleanedJson);

          if (Array.isArray(parsedResults)) {
            allResults = [...allResults, ...parsedResults];
            success = true;
          } else {
            throw new Error("Invalid JSON format from AI");
          }
        } catch (error) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff (2s, 4s, 8s)
          
          Logger.warn({ 
            message: `Chunk ${index + 1} failed (Attempt ${retryCount}). Retrying in ${delay}ms... Error: ${error}` 
          });

          if (retryCount < this.MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            Logger.error({ message: `Chunk ${index + 1} failed after ${this.MAX_RETRIES} attempts. Skipping.` });
          }
        }
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
  private static constructScreeningPrompt(job: any, candidates: any[]): string {
    const jobData = JSON.stringify({
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills,
      experienceLevel: job.experienceLevel,
      type: job.type,
      location: job.location,
    });

    const candidateData = JSON.stringify(
      candidates.map((c) => ({
        id: c._id,
        skills: c.skills,
        experience: c.experience,
        education: c.education,
        availability: c.availability,
        bio: c.bio,
        headline: c.headline,
      }))
    );

    return MASTER_SCREENING_PROMPT
      .replace("{{JOB_DATA}}", jobData)
      .replace("{{CANDIDATE_DATA}}", candidateData);
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
2. description (string - a brief overview)
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
- NEVER GUESS or auto-fill "locationId" or "departmentId" just because the user mentions a location or department name (e.g. "Remote" or "Engineering").
- To get the "locationId" or "departmentId", you MUST set "actionRequired" to "location" or "department". This will open a UI modal for the user to explicitly select an option.
- When the user selects an option from the UI, the system will send a message like "Selected location: Kigali, Rwanda (ID: 123)" or "Selected department: Engineering (ID: 456)". ONLY THEN should you extract the ID and put it in "locationId" or "departmentId".
- If "locationId" or "departmentId" is missing, set "actionRequired" to the missing field's type, and ask the user to select one from the options on screen.
- For "requiredSkills", always return an array of strings.
- For "experienceLevel", map common terms: "Senior" -> "Senior", "Junior" -> "Junior", etc.
- For "type", map: "Full time" -> "Full-time", "Contractor" -> "Contract", etc.

You MUST respond in pure JSON format (no markdown, no backticks) with this structure:
{
  "isComplete": boolean, // true ONLY if ALL 7 required fields are gathered and valid
  "nextQuestion": "string", // Friendly conversational question asking for missing details (null if complete)
  "actionRequired": "location" | "department" | null, // Set to "location" or "department" to trigger the UI modal if those IDs are missing.
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
    const match = text.match(/(\[[\s\S]*\]|{[\s\S]*})/);
    if (match) {
      return match[0];
    }
    return text.trim();
  }
}
