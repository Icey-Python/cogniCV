import { Document, Schema, model } from "mongoose";

export interface ITalentProfile {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio?: string;
  location: string;
  skills: {
    name: string;
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    yearsOfExperience: number;
  }[];
  languages?: {
    name: string;
    proficiency: "Basic" | "Conversational" | "Fluent" | "Native";
  }[];
  experience: {
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
    technologies: string[];
    isCurrent: boolean;
  }[];
  education: {
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
  projects: {
    name: string;
    description: string;
    technologies: string[];
    role: string;
    link?: string;
    startDate: string;
    endDate: string;
  }[];
  availability: {
    status: "Available" | "Open to Opportunities" | "Not Available";
    type: "Full-time" | "Part-time" | "Contract";
    startDate?: string;
  };
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
}

export interface TalentProfileDoc extends ITalentProfile, Document {}

const TalentProfileSchema = new Schema<TalentProfileDoc>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    headline: { type: String, required: true },
    bio: { type: String },
    location: { type: String, required: true },
    skills: [
      {
        name: { type: String, required: true },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
          required: true,
        },
        yearsOfExperience: { type: Number, required: true },
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
        company: { type: String, required: true },
        role: { type: String, required: true },
        startDate: { type: String, required: true },
        endDate: { type: String },
        description: { type: String },
        technologies: [String],
        isCurrent: { type: Boolean, default: false },
      },
    ],
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: { type: String, required: true },
        startYear: { type: Number, required: true },
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
        required: true,
      },
      type: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract"],
        required: true,
      },
      startDate: { type: String },
    },
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      portfolio: { type: String },
    },
  },
  { timestamps: true }
);

const TalentProfile = model<TalentProfileDoc>("TalentProfile", TalentProfileSchema);

export default TalentProfile;
