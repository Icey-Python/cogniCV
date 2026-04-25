import { Document, Schema, Types, model } from "mongoose";

export interface ShareDoc extends Document {
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;
  type: "public" | "protected";
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShareSchema = new Schema<ShareDoc>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "TalentProfile", required: true },
    type: { type: String, enum: ["public", "protected"], default: "public" },
    password: { type: String }, // Hashed password if protected
  },
  { timestamps: true }
);

const Share = model<ShareDoc>("Share", ShareSchema);
export default Share;
