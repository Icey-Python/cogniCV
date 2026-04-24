import { Document, Schema, Types, model } from "mongoose";

export interface ApplicationDoc extends Document {
  jobId: Types.ObjectId;
  profileId: Types.ObjectId; // Ref: TalentProfile
  appliedAt: Date;
  status: "applied" | "screening" | "shortlisted" | "rejected";
}

const ApplicationSchema = new Schema<ApplicationDoc>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "TalentProfile",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["applied", "screening", "shortlisted", "rejected"],
      default: "applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure a candidate can't apply to the same job twice
ApplicationSchema.index({ jobId: 1, profileId: 1 }, { unique: true });

const Application = model<ApplicationDoc>("Application", ApplicationSchema);

export default Application;
