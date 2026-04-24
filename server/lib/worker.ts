import axios from "axios";
import { Logger } from "borgen";
import { getChannel, RabbitMQQueues } from "./rabbitmq";
import { ParserService } from "../services/parser.service";
import ExternalApplicant from "../models/applicant.model";
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
    const updatedApplicantIds = new Set<string>();

    await Promise.all(
      parsedProfiles.map(async (profile: any) => {
        const originalData = taskData[profile.candidateIndex];
        if (!originalData) return;
        updatedApplicantIds.add(String(originalData.applicantId));

        await ExternalApplicant.findByIdAndUpdate(originalData.applicantId, {
          parsedProfile: profile,
          parsingStatus: "success",
        });
      })
    );

    await Promise.all(
      taskData
        .filter((data) => !updatedApplicantIds.has(String(data.applicantId)))
        .map((data) =>
          ExternalApplicant.findByIdAndUpdate(data.applicantId, {
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
        await ExternalApplicant.findByIdAndUpdate(task.applicantId, {
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
        await ExternalApplicant.findByIdAndUpdate(task.applicantId, {
          parsingStatus: "failed",
          errorMessage: "Batch processing error after retries: " + error.message,
        });
      }

      channel.ack(msg);
    }
  }
};

const parseTaskMessage = (msg: amqp.ConsumeMessage): {
  applicantId: string;
  resumeUrl: string;
  jobId: string;
} => {
  return JSON.parse(msg.content.toString());
};

const getProcessingAttempt = (msg: amqp.ConsumeMessage): number => {
  const attempt = msg.properties.headers?.processingAttempt;
  return typeof attempt === "number" ? attempt : 0;
};
