import { App, ExpressReceiver } from "@slack/bolt";
import { Logger } from "borgen";
import { ENV } from "../../lib/environments";
import { ChromaService } from "../../services/chroma.service";
import SlackContext from "../../models/slackContext.model";
import Job from "../../models/job.model";
import { Types } from "mongoose";

// Initialize the ExpressReceiver
export const slackReceiver = new ExpressReceiver({
  signingSecret: ENV.SLACK_SIGNING_SECRET,
  endpoints: "/events",
  processBeforeResponse: true,
});

Logger.info({ message: `Slack signing secret loaded. Length: ${ENV.SLACK_SIGNING_SECRET?.length || 0}` });


// Initialize the Bolt App
const app = new App({
  token: ENV.SLACK_BOT_TOKEN,
  receiver: slackReceiver,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getOrUpdateContext(slackUserId: string, slackChannelId: string, updates: any = {}) {
  let context = await SlackContext.findOne({ slackUserId, slackChannelId });
  if (!context) {
    context = new SlackContext({ slackUserId, slackChannelId });
  }
  
  if (updates.jobId) context.jobId = updates.jobId;
  if (updates.message) {
    context.history.push(updates.message);
    context.lastInteraction = new Date();
  }
  
  if (updates.clearHistory) {
    context.history = [];
  }

  await context.save();
  return context;
}

async function safeSay(client: any, channel: string, message: any) {
  const payload = typeof message === "string" 
    ? { channel, text: message } 
    : { channel, text: "Message from cogniCV", ...message };

  try {
    await client.chat.postMessage(payload);
  } catch (error: any) {
    if (error.data?.error === "not_in_channel") {
      Logger.info({ message: `Bot not in channel ${channel}, attempting to join...` });
      try {
        await client.conversations.join({ channel });
        await client.chat.postMessage(payload);
      } catch (joinError) {
        Logger.error({ message: `Failed to join channel ${channel}: ${joinError}` });
      }
    } else {
      throw error;
    }
  }
}

async function handleQuestion(client: any, slackUserId: string, slackChannelId: string, question: string) {
  const context = await getOrUpdateContext(slackUserId, slackChannelId);

  if (!context.jobId) {
    // No job in context, search for jobs
    const jobs = await ChromaService.searchJobs(question, 3);
    
    if (jobs.length === 0) {
      await safeSay(client, slackChannelId, "I couldn't find any job listings related to that. Can you tell me the specific job title you're interested in?");
      return;
    }

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "I found a few relevant job listings. Which one would you like to discuss?",
        },
      },
      {
        type: "actions",
        elements: jobs.map((job) => ({
          type: "button",
          text: {
            type: "plain_text",
            text: job.title,
            emoji: true,
          },
          value: job.jobId,
          action_id: "select_job",
        })),
      },
    ];

    await safeSay(client, slackChannelId, { 
      text: "I found a few relevant job listings. Which one would you like to discuss?",
      blocks 
    });
    return;
  }

  // Job exists in context, perform RAG query
  try {
    const history = context.history.map(h => ({ role: h.role, content: h.content }));
    const answer = await ChromaService.queryJobAnalysis(context.jobId.toString(), question, history, "mrkdwn");

    // Update context history
    await getOrUpdateContext(slackUserId, slackChannelId, {
      message: { role: "user", content: question, timestamp: new Date() }
    });
    await getOrUpdateContext(slackUserId, slackChannelId, {
      message: { role: "assistant", content: answer, timestamp: new Date() }
    });

    await safeSay(client, slackChannelId, {
      text: answer,
    });
  } catch (error) {
    Logger.error({ message: "Error in Slack RAG query: " + error });
    await safeSay(client, slackChannelId, "Sorry, I encountered an error while analyzing the job data. 🤖");
  }
}

// ─── Bolt Listeners ──────────────────────────────────────────────────────────

// Handle Slash Command /cogni
app.command("/cogni", async ({ command, ack, client }) => {
  await ack();
  
  const text = command.text.trim().toLowerCase();
  
  if (text === "help" || !text) {
    await safeSay(client, command.channel_id, "Welcome to cogniCV! 🚀\n\nYou can ask me questions about your job listings and candidate analysis.\n\nTry:\n• `/cogni find candidates for React Developer` (to start a new discussion)\n• Mention me in a channel with a question about an existing analysis.");
    return;
  }

  // Reset context and start fresh for this command if it looks like a search
  await getOrUpdateContext(command.user_id, command.channel_id, { jobId: null, clearHistory: true });
  await handleQuestion(client, command.user_id, command.channel_id, command.text);
});

// Handle App Mentions
app.event("app_mention", async ({ event, client }) => {
  const slackUserId = event.user;
  const slackChannelId = event.channel;

  if (!slackUserId || !slackChannelId) return;

  // Strip the bot mention from the text
  const question = event.text.replace(/<@U[A-Z0-9]+>/g, "").trim();
  if (!question) {
    await safeSay(client, slackChannelId, "Hi! How can I help you with your candidate analysis today?");
    return;
  }
  
  await handleQuestion(client, slackUserId, slackChannelId, question);
});

// Handle Direct Messages
app.message(async ({ message, client }) => {
  if (message.subtype) return; // Skip sub-messages (deleted, changed, etc.)
  
  // Cast to specific message type to access user/text
  const msg = message as any;
  if (!msg.user || !msg.text) return;

  await handleQuestion(client, msg.user, msg.channel, msg.text);
});

// Handle Job Selection Button
app.action("select_job", async ({ body, ack, client }) => {
  await ack();
  
  const actionBody = body as any;
  const jobId = actionBody.actions[0].value;
  const slackUserId = actionBody.user.id;
  const slackChannelId = actionBody.channel.id;

  const job = await Job.findById(jobId);
  if (!job) {
    await client.chat.postMessage({
      channel: slackChannelId,
      text: "Sorry, I couldn't find that job listing anymore.",
    });
    return;
  }

  // Update context with the selected job
  await getOrUpdateContext(slackUserId, slackChannelId, { jobId: new Types.ObjectId(jobId), clearHistory: true });

  await safeSay(client, slackChannelId, `Great! I've loaded the analysis for *${job.title}*. What would you like to know? You can ask about candidate rankings, specific strengths, or overall recommendations.`);
});

Logger.info({ message: "Slack Bolt app initialized" });
