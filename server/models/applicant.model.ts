import { Document, Schema, Types, model } from "mongoose";

export interface ExternalApplicantDoc extends Document {
  jobId: Types.ObjectId;
  source: "csv" | "pdf";
  rawText?: string; // For PDF text extraction
  parsedProfile: any; // Mapped to TalentProfile schema
  parsingStatus: "success" | "partial" | "failed" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

const ExternalApplicantSchema = new Schema<ExternalApplicantDoc>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["csv", "pdf"],
      required: true,
    },
    rawText: {
      type: String,
    },
    parsedProfile: {
      type: Object, // Structured normalized data
    },
    parsingStatus: {
      type: String,
      enum: ["success", "partial", "failed", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const ExternalApplicant = model<ExternalApplicantDoc>(
  "ExternalApplicant",
  ExternalApplicantSchema
);

export default ExternalApplicant;
