import "dotenv/config";

export const ENV = {
  SERVER_PORT: process.env.SERVER_PORT || 8001,
  MONGO_URI: process.env.MONGO_URI as string,
  NODE_ENV: process.env.NODE_ENV as string,
  FRONTEND_URLS: process.env.FRONTEND_URLS as string,
  // API Docs
  API_DOCS_USER: process.env.API_DOCS_USER || "admin",
  API_DOCS_PASSWORD: process.env.API_DOCS_PASSWORD || "admin",
  API_DOCS_SERVER: process.env.API_DOCS_SERVER || "http://localhost:8001",
  API_DOCS_REALM: process.env.API_DOCS_REALM || "your_api_docs",
  // JWT related
  JWT_SECRET: process.env.JWT_SECRET as string,
  // Admin
  ADMIN_INITIAL_PASS: process.env.ADMIN_INITIAL_PASS as string,
  ADMIN_INITIAL_EMAIL: process.env.ADMIN_INITIAL_EMAIL as string,
  // AI/Gemini
  GEMINI_API_KEY: process.env.GEMINI_API_KEY as string,
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  // RabbitMQ
  RABBITMQ_URL: process.env.RABBITMQ_URL || "amqp://localhost",
  // ChromaDB
  CHROMA_URL: process.env.CHROMA_URL || "http://localhost:8000",
  // Cloudflare R2
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID as string,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY as string,
  R2_ENDPOINT: process.env.R2_ENDPOINT as string,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME as string,
  R2_PUBLIC_DOMAIN: process.env.R2_PUBLIC_DOMAIN as string,
  // Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY as string,
  // Slack Integration
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET as string,
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN as string,
};

export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev";

// Check that all required env variables are set
for (const [key, value] of Object.entries(ENV)) {
  if (value === undefined) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

export const AllowedOrigins = [
  ...ENV.FRONTEND_URLS.split(","),
  "http://localhost:8001",
];
