import { Document, Schema, Types, model } from "mongoose";

export interface ExternalApplicantDoc extends Document {
  jobId: Types.ObjectId;
  source: "csv" | "pdf";
  rawText?: string;
  resumeUrl?: string; // Link to R2 storage
  parsedProfile: any;
  parsingStatus: "success" | "partial" | "failed" | "pending";
  errorMessage?: string; // For worker failures
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
    resumeUrl: {
      type: String,
    },
    parsedProfile: {
      type: Object,
    },
    parsingStatus: {
      type: String,
      enum: ["success", "partial", "failed", "pending"],
      default: "pending",
    },
    errorMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

const ExternalApplicant = model<ExternalApplicantDoc>(
  "ExternalApplicant",
  ExternalApplicantSchema
);

export default ExternalApplicant;
