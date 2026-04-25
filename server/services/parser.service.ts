import pdf from "pdf-parse-new";
import * as xlsx from "xlsx";
import { Logger } from "borgen";
import { ENV } from "../lib/environments";
import { RESUME_BATCH_PARSER_PROMPT, SPREADSHEET_MAPPER_PROMPT } from "../lib/prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

export class ParserService {
  private static model = genAI.getGenerativeModel({ model: ENV.GEMINI_MODEL });

  /**
   * Extracts rows from a CSV/Excel spreadsheet and normalizes them via AI
   */
  static async parseSpreadsheet(buffer: Buffer): Promise<any[]> {
    try {
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error("Spreadsheet contains no sheets");
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = xlsx
        .utils
        .sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" })
        .filter((row) => Object.values(row).some((value) => String(value).trim() !== ""));

      if (rows.length === 0) {
        throw new Error("Spreadsheet contains no data rows");
      }

      const prompt = SPREADSHEET_MAPPER_PROMPT.replace(
        "{{RAW_ROWS}}",
        JSON.stringify(rows)
      );

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanedJson = this.extractJsonArray(text);
      const parsedProfiles = JSON.parse(cleanedJson);

      if (!Array.isArray(parsedProfiles)) {
        throw new Error("Spreadsheet parser returned invalid JSON");
      }

      return parsedProfiles;
    } catch (error) {
      Logger.error({ message: "Spreadsheet Parsing Error: " + error });
      throw error;
    }
  }

  /**
   * Extracts data from a batch of PDF resumes and normalizes them via AI
   */
  static async parseResumeBatch(buffers: Buffer[]): Promise<any[]> {
    try {
      // 1. Extract raw text from all PDFs in the batch
      const textExtractions = await Promise.all(
        buffers.map(async (buf) => {
          try {
            const data = await pdf(buf);
            return data.text;
          } catch (e) {
            return "UNREADABLE_PDF_CONTENT";
          }
        })
      );

      // 2. Call AI with the batch of texts
      const currentDate = new Date().toISOString().split('T')[0];
      const prompt = RESUME_BATCH_PARSER_PROMPT
        .replace("{{RAW_TEXT_ARRAY}}", JSON.stringify(textExtractions))
        .replace("{{CURRENT_DATE}}", currentDate);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // 3. Extract and parse JSON array
      const cleanedJson = this.extractJsonArray(text);
      const parsedProfiles = JSON.parse(cleanedJson);

      return parsedProfiles;
    } catch (error) {
      Logger.error({ message: "Batch Parsing Error: " + error });
      throw error;
    }
  }

  private static extractJsonArray(text: string): string {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) return jsonMatch[0];
    return text.trim();
  }
}
