import { Document, Schema, Types, model } from "mongoose";

export interface SessionDoc extends Document {
  sessionId: string;
  userId: Types.ObjectId;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  lastActivity: Date;
  isValid: boolean;
}

const SessionSchema: Schema = new Schema<SessionDoc>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      index: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "session",
  }
);

const Session = model<SessionDoc>("session", SessionSchema);

export default Session;
