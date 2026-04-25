import { Document, Schema, Types, model } from "mongoose";

export interface IScoreBreakdown {
  skills: number;
  experience: number;
  education: number;
  relevance: number;
}

export interface IReasoning {
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

export interface IRankedCandidate {
  rank: number;
  candidateId: Types.ObjectId;
  profileSource: "internal" | "pdf" | "csv" | "xlsx";
  matchScore: number;
  subScores: IScoreBreakdown;
  reasoning: IReasoning;
  profileSnapshot: any; // Snapshot of profile at time of screening
}

export interface ScreeningResultDoc extends Document {
  jobId: Types.ObjectId;
  rankedCandidates: IRankedCandidate[];
  status: "pending" | "completed" | "failed";
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScreeningResultSchema = new Schema<ScreeningResultDoc>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    rankedCandidates: [
      {
        rank: { type: Number, required: true },
        candidateId: { type: Schema.Types.ObjectId, required: true },
        profileSource: {
          type: String,
          enum: ["internal", "pdf", "csv", "xlsx"],
          required: true,
        },
        matchScore: { type: Number, required: true },
        subScores: {
          skills: { type: Number, required: true },
          experience: { type: Number, required: true },
          education: { type: Number, required: true },
          relevance: { type: Number, required: true },
        },
        reasoning: {
          strengths: [String],
          gaps: [String],
          recommendation: { type: String, required: true },
        },
        profileSnapshot: { type: Object, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    error: { type: String },
  },
  { timestamps: true }
);

const ScreeningResult = model<ScreeningResultDoc>(
  "ScreeningResult",
  ScreeningResultSchema
);

export default ScreeningResult;
