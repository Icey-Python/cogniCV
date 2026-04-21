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
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
  // S3 / Minio related
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY as string,
  AWS_SECRET: process.env.AWS_SECRET as string,
  AWS_REGION: process.env.AWS_REGION as string,
  AWS_S3_ENDPOINT: process.env.AWS_S3_ENDPOINT as string,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET as string,
  // Admin
  ADMIN_INITIAL_PASS: process.env.ADMIN_INITIAL_PASS as string,
  ADMIN_INITIAL_EMAIL: process.env.ADMIN_INITIAL_EMAIL as string,
  RESEND_KEY: process.env.RESEND_KEY as string,
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

export const AllowedOrigins = [...ENV.FRONTEND_URLS.split(",")];
