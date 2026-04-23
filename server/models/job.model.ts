import { Document, Schema, Types, model } from "mongoose";

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

export interface JobDoc extends Document {
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: ExperienceLevel;
  type: JobType;
  location: string;
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
    location: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const Job = model<JobDoc>("Job", JobSchema);

export default Job;
