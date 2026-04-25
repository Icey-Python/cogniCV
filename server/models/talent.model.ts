import { Document, Schema, model } from "mongoose";

export interface ITalentProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  headline?: string;
  bio?: string;
  location?: string;
  skills?: {
    name: string;
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    yearsOfExperience: number;
  }[];
  languages?: {
    name: string;
    proficiency: "Basic" | "Conversational" | "Fluent" | "Native";
  }[];
  experience?: {
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
    technologies: string[];
    isCurrent: boolean;
  }[];
  education?: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear: number;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    issueDate: string;
  }[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    role: string;
    link?: string;
    startDate: string;
    endDate: string;
  }[];
  availability?: {
    status: "Available" | "Open to Opportunities" | "Not Available";
    type: "Full-time" | "Part-time" | "Contract";
    startDate?: string;
  };
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  source: "csv" | "pdf" | "xlsx" | "internal";
  resumeUrl?: string;
  parsingStatus?: "success" | "partial" | "failed" | "pending";
  errorMessage?: string;
}

export interface TalentProfileDoc extends ITalentProfile, Document {}

const TalentProfileSchema = new Schema<TalentProfileDoc>(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, index: true },
    headline: { type: String },
    bio: { type: String },
    location: { type: String },
    skills: [
      {
        name: { type: String },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
        },
        yearsOfExperience: { type: Number },
      },
    ],
    languages: [
      {
        name: { type: String },
        proficiency: {
          type: String,
          enum: ["Basic", "Conversational", "Fluent", "Native"],
        },
      },
    ],
    experience: [
      {
        company: { type: String },
        role: { type: String },
        startDate: { type: String },
        endDate: { type: String },
        description: { type: String },
        technologies: [String],
        isCurrent: { type: Boolean, default: false },
      },
    ],
    education: [
      {
        institution: { type: String },
        degree: { type: String },
        fieldOfStudy: { type: String },
        startYear: { type: Number },
        endYear: { type: Number },
      },
    ],
    certifications: [
      {
        name: { type: String },
        issuer: { type: String },
        issueDate: { type: String },
      },
    ],
    projects: [
      {
        name: { type: String },
        description: { type: String },
        technologies: [String],
        role: { type: String },
        link: { type: String },
        startDate: { type: String },
        endDate: { type: String },
      },
    ],
    availability: {
      status: {
        type: String,
        enum: ["Available", "Open to Opportunities", "Not Available"],
      },
      type: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract"],
      },
      startDate: { type: String },
    },
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      portfolio: { type: String },
    },
    source: {
      type: String,
      enum: ["csv", "pdf", "xlsx", "internal"],
      required: true,
      default: "internal"
    },
    resumeUrl: { type: String },
    parsingStatus: {
      type: String,
      enum: ["success", "partial", "failed", "pending"],
    },
    errorMessage: { type: String }
  },
  { timestamps: true }
);

const TalentProfile = model<TalentProfileDoc>("TalentProfile", TalentProfileSchema);

export default TalentProfile;
