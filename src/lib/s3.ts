import { S3Client, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export const S3_BUCKET = process.env.S3_BUCKET_NAME ?? "";
export const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN ?? "";

export function getReceiptImageUrl(s3Key: string): string {
  if (CLOUDFRONT_DOMAIN) {
    return `https://${CLOUDFRONT_DOMAIN}/${s3Key}`;
  }
  return `https://${S3_BUCKET}.s3.amazonaws.com/${s3Key}`;
}

export async function generatePresignedUploadUrl(
  userId: string,
  fileExtension: string,
  contentType: string
): Promise<{ presignedUrl: string; s3Key: string; imageUrl: string }> {
  const fileId = uuidv4();
  const ext = fileExtension.startsWith(".") ? fileExtension : `.${fileExtension}`;
  const s3Key = `receipts/${userId}/${fileId}${ext}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  });

  const imageUrl = getReceiptImageUrl(s3Key);

  return { presignedUrl, s3Key, imageUrl };
}

export async function getObjectBuffer(s3Key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
  });

  const response = await s3Client.send(command);
  const chunks: Uint8Array[] = [];

  if (!response.Body) {
    throw new Error("Empty S3 response body");
  }

  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export async function objectExists(s3Key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
    });
    await s3Client.send(command);
    return true;
  } catch {
    return false;
  }
}
