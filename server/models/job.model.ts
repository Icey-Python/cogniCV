import { Document, Schema, Types, model } from "mongoose";
import { Location } from "./organization.model";

export enum ExperienceLevel {
  ENTRY = "Entry",
  JUNIOR = "Junior",
  MID = "Mid",
  SENIOR = "Senior",
  LEAD = "Lead",
}

export enum JobType {
  FULL_TIME = "Full-time",
  PART_TIME = "Part-time",
  CONTRACT = "Contract",
}

export enum JobStatus {
  ACTIVE = "Active",
  CLOSED = "Closed",
  DRAFT = "Draft",
}

export enum JobSource {
  INTERNAL = "Internal",
  EXTERNAL = "External",
}

export interface IAnalysisWeights {
  skills: number;
  experience: number;
  education: number;
  relevance: number;
}

export interface JobDoc extends Document {
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: ExperienceLevel;
  type: JobType;
  status: JobStatus;
  source: JobSource;
  location: Location;
  aiFocusArea?: string;
  analysisWeights: IAnalysisWeights;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema<JobDoc>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      enum: Object.values(ExperienceLevel),
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(JobType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.ACTIVE,
    },
    source: {
      type: String,
      enum: Object.values(JobSource),
      default: JobSource.INTERNAL,
    },
    location: {
      country: { type: String, required: true },
      city: { type: String, required: true },
      workspaceType: {
        type: String,
        enum: ["Remote", "Hybrid", "On-site"],
        required: true,
      },
      isDefault: { type: Boolean, default: false },
    },
    aiFocusArea: {
      type: String,
      required: false,
    },
    analysisWeights: {
      skills: { type: Number, default: 40 },
      experience: { type: Number, default: 25 },
      education: { type: Number, default: 15 },
      relevance: { type: Number, default: 20 },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

const Job = model<JobDoc>("Job", JobSchema);

export default Job;
