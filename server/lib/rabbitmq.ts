import amqp, { Channel, ChannelModel } from "amqplib";
import { Logger } from "borgen";
import { ENV } from "./environments";

export enum RabbitMQQueues {
  RESUME_INGESTION = "resume_ingestion",
}

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let isConnecting = false;

/**
 * Connect to RabbitMQ with retry logic
 */
async function connectWithRetry(retries = 10, delay = 10000): Promise<ChannelModel> {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await amqp.connect(ENV.RABBITMQ_URL, {
        heartbeat: 60,
        connectionTimeout: 30000,
        authenticationTimeout: 30000,
        handshakeTimeout: 30000,
      });
      Logger.info({ message: "CONNECTED to RabbitMQ" });
      return conn;
    } catch (err) {
      Logger.warn({
        message: `RabbitMQ NOT READY, retrying in ${delay}ms... (${i + 1}/${retries})`,
      });
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error("FAILED to connect to RabbitMQ after multiple attempts");
}

/**
 * Initialize RabbitMQ connection and channel
 */
export const initRabbitMQ = async (): Promise<void> => {
  if (isConnecting) return;
  isConnecting = true;

  try {
    connection = await connectWithRetry();

    connection.on("error", (err) => {
      Logger.error({ message: "RabbitMQ connection error: " + err.message });
      channel = null;
      connection = null;
    });

    connection.on("close", () => {
      Logger.warn({ message: "RabbitMQ connection closed. Attempting to reconnect..." });
      channel = null;
      connection = null;
      isConnecting = false;
      setTimeout(() => initRabbitMQ(), 5000);
    });

    const createdChannel = await connection.createChannel();
    channel = createdChannel;

    createdChannel.on("error", (err) => {
      Logger.error({ message: "RabbitMQ CHANNEL ERROR: " + err.message });
    });

    createdChannel.on("close", () => {
      Logger.warn({ message: "RabbitMQ channel closed" });
      channel = null;
    });

    await createdChannel.assertQueue(RabbitMQQueues.RESUME_INGESTION, { durable: true });
    await createdChannel.prefetch(5); // For our batching logic

    Logger.info({ message: "RabbitMQ INITIALIZED successfully" });

    // Start our ingestion worker automatically once the channel is ready
    const { startWorker } = await import("./worker");
    await startWorker();

  } catch (error) {
    Logger.error({ message: "Critical failure in RabbitMQ initialization: " + error });
    isConnecting = false;
    throw error;
  } finally {
    isConnecting = false;
  }
};

/**
 * Get the current RabbitMQ channel
 */
export const getChannel = (): Channel | null => {
  return channel;
};

/**
 * Publish a message to a specific queue
 */
export const publishToQueue = async (
  queueName: string,
  message: Record<string, any>
): Promise<void> => {
  if (!channel) {
    Logger.warn({ message: "RabbitMQ channel not initialized. Reconnecting..." });
    await initRabbitMQ();
    if (!channel) throw new Error("RabbitMQ channel unavailable");
  }

  try {
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
  } catch (error) {
    Logger.error({ message: "Failed to publish message: " + error });
    channel = null; // Reset to trigger reconnection
    throw error;
  }
};
