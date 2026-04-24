import pdf from "pdf-parse-new";
import * as xlsx from "xlsx";
import { Logger } from "borgen";
import { ENV } from "../lib/environments";
import { RESUME_PARSER_PROMPT, SPREADSHEET_MAPPER_PROMPT } from "../lib/prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

export class ParserService {
  private static model = genAI.getGenerativeModel({ model: ENV.GEMINI_MODEL });

  /**
   * Extracts data from a Spreadsheet buffer and normalizes it via AI
   */
  static async parseSpreadsheet(buffer: Buffer): Promise<any[]> {
    try {
      // 1. Read workbook
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // 2. Convert to JSON rows
      const rawRows = xlsx.utils.sheet_to_json(worksheet);

      if (!rawRows || rawRows.length === 0) {
        throw new Error("Spreadsheet is empty.");
      }

      // 3. Call AI to map rows (Batch process rows)
      // For large sheets, we chunk these too, but let's start with a batch of up to 20
      const prompt = SPREADSHEET_MAPPER_PROMPT.replace("{{RAW_ROWS}}", JSON.stringify(rawRows.slice(0, 20)));
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanedJson = this.extractJsonArray(text);
      const parsedProfiles = JSON.parse(cleanedJson);

      return parsedProfiles;
    } catch (error) {
      Logger.error({ message: "Spreadsheet Parsing Error: " + error });
      throw error;
    }
  }

  /**
   * Extracts text from a PDF buffer and normalizes it via AI
   */
  static async parseResume(buffer: Buffer): Promise<any> {
    try {
      // 1. Extract raw text from PDF
      const data = await pdf(buffer);
      const rawText = data.text;

      if (!rawText || rawText.trim().length < 50) {
        throw new Error("PDF seems empty or contains unreadable text (e.g., scanned images without OCR).");
      }

      // 2. Call AI to normalize text into schema
      const prompt = RESUME_PARSER_PROMPT.replace("{{RAW_TEXT}}", rawText);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // 3. Extract and parse JSON
      const cleanedJson = this.extractJsonObject(text);
      const parsedProfile = JSON.parse(cleanedJson);

      return parsedProfile;
    } catch (error) {
      Logger.error({ message: "Parsing Error: " + error });
      throw error;
    }
  }

  private static extractJsonObject(text: string): string {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return jsonMatch[0];
    return text.trim();
  }

  private static extractJsonArray(text: string): string {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) return jsonMatch[0];
    return text.trim();
  }
}
