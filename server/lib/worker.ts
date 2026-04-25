import axios from "axios";
import { Logger } from "borgen";
import { getChannel, RabbitMQQueues } from "./rabbitmq";
import { ParserService } from "../services/parser.service";
import { ChromaService } from "../services/chroma.service";
import TalentProfile from "../models/talent.model";
import Application from "../models/application.model";
import amqp from "amqplib";

const BATCH_SIZE = 5;
const BATCH_TIMEOUT_MS = 2000;

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

  // Start the embedding generation consumer
  startEmbeddingWorker();
};

const processBatch = async () => {
  const currentBatch = [...batchBuffer];
  batchBuffer = [];
  batchTimeout = null;

  const channel = getChannel();
  if (!channel || currentBatch.length === 0) return;

  Logger.info({ message: `Processing batch of ${currentBatch.length} resumes...` });

  try {
    const taskData = currentBatch.map((msg) => JSON.parse(msg.content.toString()));
    
    const buffers = await Promise.all(
      taskData.map(async (data) => {
        const response = await axios.get(data.resumeUrl, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
      })
    );

    const parsedProfiles = await ParserService.parseResumeBatch(buffers);

    await Promise.all(
      parsedProfiles.map(async (profile: any) => {
        const originalData = taskData[profile.candidateIndex];
        if (!originalData) return;

        const { talentId, jobId } = originalData;

        // 1. IDENTITY CHECK: Find if this email already exists
        const existingTalent = await TalentProfile.findOne({ 
          email: profile.email,
          _id: { $ne: talentId } // Don't match the current temporary record
        });

        if (existingTalent) {
          Logger.info({ message: `Smart Merge: Updating existing profile for ${profile.email}` });

          // A. Update the existing profile with LATEST resume data
          await TalentProfile.findByIdAndUpdate(existingTalent._id, {
            ...profile,
            parsingStatus: "success",
            source: "pdf"
          });

          // B. Link this existing profile to the NEW job (if not already linked)
          const existingApp = await Application.findOne({ 
            jobId, 
            profileId: existingTalent._id 
          });

          if (!existingApp) {
            await Application.create({ jobId, profileId: existingTalent._id });
          }

          // C. Cleanup: Remove the temporary placeholder talent and its application
          await Application.findOneAndDelete({ jobId, profileId: talentId });
          await TalentProfile.findByIdAndDelete(talentId);

        } else {
          // 2. NEW TALENT: Simply update the placeholder record
          await TalentProfile.findByIdAndUpdate(talentId, {
            ...profile,
            parsingStatus: "success",
          });
        }
      })
    );

    currentBatch.forEach((msg) => channel.ack(msg));
    Logger.info({ message: `Batch of ${currentBatch.length} successfully processed.` });

  } catch (error: any) {
    Logger.error({ message: "Batch processing failure: " + error.message });

    for (const msg of currentBatch) {
      const { talentId } = JSON.parse(msg.content.toString());
      await TalentProfile.findByIdAndUpdate(talentId, {
        parsingStatus: "failed",
        errorMessage: "Batch processing error: " + error.message,
      });
      channel.ack(msg);
    }
  }
};

/**
 * Embedding Generation Worker
 * Listens for completed screenings and indexes them into ChromaDB
 */
const startEmbeddingWorker = () => {
  const channel = getChannel();
  if (!channel) return;

  Logger.info({ message: "Embedding Worker listening..." });

  channel.consume(RabbitMQQueues.EMBEDDING_GENERATION, async (msg) => {
    if (!msg) return;

    try {
      const { jobId } = JSON.parse(msg.content.toString());
      Logger.info({ message: `[EmbeddingWorker] Processing job ${jobId}...` });

      await ChromaService.indexJobAnalysis(jobId);

      channel.ack(msg);
      Logger.info({ message: `[EmbeddingWorker] Successfully indexed job ${jobId}` });
    } catch (error: any) {
      Logger.error({ message: `[EmbeddingWorker] Failed: ${error.message}` });
      // Ack the message to avoid infinite retry loops
      // The recruiter can re-trigger screening if needed
      channel.ack(msg);
    }
  });
};
