import { Document, Schema, Types, model } from "mongoose";

export interface ISlackMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface SlackContextDoc extends Document {
  slackUserId: string;
  slackChannelId: string;
  jobId?: Types.ObjectId;
  history: ISlackMessage[];
  lastInteraction: Date;
}

const SlackContextSchema: Schema = new Schema<SlackContextDoc>(
  {
    slackUserId: {
      type: String,
      required: true,
      index: true,
    },
    slackChannelId: {
      type: String,
      required: true,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: false,
    },
    history: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    lastInteraction: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "slack_context",
  },
);

// Compound index for unique user-channel sessions
SlackContextSchema.index({ slackUserId: 1, slackChannelId: 1 }, { unique: true });

const SlackContext = model<SlackContextDoc>("SlackContext", SlackContextSchema);

export default SlackContext;
