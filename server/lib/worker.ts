import axios from "axios";
import { Logger } from "borgen";
import { getChannel, RabbitMQQueues } from "./rabbitmq";
import { ParserService } from "../services/parser.service";
import TalentProfile from "../models/talent.model";
import Application from "../models/application.model";
import amqp from "amqplib";

const BATCH_SIZE = 5;
const BATCH_TIMEOUT_MS = 2000;
const MAX_PROCESSING_ATTEMPTS = 3;

let batchBuffer: amqp.ConsumeMessage[] = [];
let batchTimeout: NodeJS.Timeout | null = null;

/**
 * The Resume Ingestion Worker
 */
export const startWorker = async () => {
  const channel = getChannel();
  if (!channel) {
    Logger.error({ message: "Cannot start worker: RabbitMQ channel not ready" });
    return;
  }

  Logger.info({ message: `Batch Worker listening (Size: ${BATCH_SIZE})...` });

  channel.consume(RabbitMQQueues.RESUME_INGESTION, (msg) => {
    if (!msg) return;
    
    batchBuffer.push(msg);

    if (batchBuffer.length >= BATCH_SIZE) {
      if (batchTimeout) clearTimeout(batchTimeout);
      processBatch();
    } else if (!batchTimeout) {
      batchTimeout = setTimeout(() => {
        processBatch();
      }, BATCH_TIMEOUT_MS);
    }
  });
};

const processBatch = async () => {
  const currentBatch = [...batchBuffer];
  batchBuffer = [];
  batchTimeout = null;

  const channel = getChannel();
  if (!channel || currentBatch.length === 0) return;

  Logger.info({ message: `Processing batch of ${currentBatch.length} resumes...` });

  try {
    const taskData = currentBatch.map((msg) => parseTaskMessage(msg));
    
    const buffers = await Promise.all(
      taskData.map(async (data) => {
        const response = await axios.get(data.resumeUrl, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
      })
    );

    const parsedProfiles = await ParserService.parseResumeBatch(buffers);
    const updatedTalentIds = new Set<string>();

    await Promise.all(
      parsedProfiles.map(async (profile: any) => {
        const originalData = taskData[profile.candidateIndex];
        if (!originalData) return;
        updatedTalentIds.add(String(originalData.talentId));

        // 1. Check if another talent profile exists with this email
        const existingTalent = await TalentProfile.findOne({ email: profile.email });

        if (existingTalent && String(existingTalent._id) !== String(originalData.talentId)) {
          Logger.info({ message: `Deduplicating talent: Found existing profile for ${profile.email}` });

          // Update existing talent with latest parsed data
          Object.assign(existingTalent, profile, { parsingStatus: "success" });
          await existingTalent.save();

          // Check if an application already exists for this existing talent and job
          const duplicateApplication = await Application.findOne({
            jobId: originalData.jobId,
            profileId: existingTalent._id,
          });

          if (duplicateApplication) {
            // Already applied! Just delete the temporary application and placeholder talent
            await Application.findOneAndDelete({
              jobId: originalData.jobId,
              profileId: originalData.talentId,
            });
          } else {
            // New application for existing talent: Update the temporary application link
            await Application.findOneAndUpdate(
              { jobId: originalData.jobId, profileId: originalData.talentId },
              { profileId: existingTalent._id }
            );
          }

          // Delete the temporary placeholder talent
          await TalentProfile.findByIdAndDelete(originalData.talentId);
        } else {
          // 2. Normal update for the placeholder talent
          await TalentProfile.findByIdAndUpdate(originalData.talentId, {
            ...profile,
            parsingStatus: "success",
          });
        }
      })
    );

    await Promise.all(
      taskData
        .filter((data) => !updatedTalentIds.has(String(data.talentId)))
        .map((data) =>
          TalentProfile.findByIdAndUpdate(data.talentId, {
            parsingStatus: "failed",
            errorMessage: "AI parser did not return a result for this resume",
          })
        )
    );

    currentBatch.forEach((msg) => channel.ack(msg));
    Logger.info({ message: `Batch of ${currentBatch.length} successfully processed.` });

  } catch (error: any) {
    Logger.error({ message: "Batch processing failure: " + error.message });

    for (const msg of currentBatch) {
      const task = parseTaskMessage(msg);
      const attempt = getProcessingAttempt(msg) + 1;

      if (attempt < MAX_PROCESSING_ATTEMPTS) {
        await TalentProfile.findByIdAndUpdate(task.talentId, {
          parsingStatus: "pending",
          errorMessage: `Retrying resume parsing (${attempt}/${MAX_PROCESSING_ATTEMPTS}): ${error.message}`,
        });

        channel.sendToQueue(RabbitMQQueues.RESUME_INGESTION, msg.content, {
          persistent: true,
          headers: {
            ...msg.properties.headers,
            processingAttempt: attempt,
          },
        });
      } else {
        await TalentProfile.findByIdAndUpdate(task.talentId, {
          parsingStatus: "failed",
          errorMessage: "Batch processing error after retries: " + error.message,
        });
      }

      channel.ack(msg);
    }
  }
};

const parseTaskMessage = (msg: amqp.ConsumeMessage): {
  talentId: string;
  resumeUrl: string;
  jobId: string;
} => {
  return JSON.parse(msg.content.toString());
};

const getProcessingAttempt = (msg: amqp.ConsumeMessage): number => {
  const attempt = msg.properties.headers?.processingAttempt;
  return typeof attempt === "number" ? attempt : 0;
};
