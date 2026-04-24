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
   * Extract JSON from a potentially markdown-wrapped string
   */
  private static extractJson(text: string): string {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    return text.trim();
  }
}
