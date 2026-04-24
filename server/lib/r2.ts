import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ENV } from "./environments";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: "auto",
  endpoint: ENV.R2_ENDPOINT,
  credentials: {
    accessKeyId: ENV.R2_ACCESS_KEY_ID,
    secretAccessKey: ENV.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a buffer to Cloudflare R2
 */
export const uploadToR2 = async (
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  const key = `resumes/${uuidv4()}-${fileName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: ENV.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  // Return the public URL or the key depending on how we serve it
  return `${ENV.R2_PUBLIC_DOMAIN}/${key}`;
};
