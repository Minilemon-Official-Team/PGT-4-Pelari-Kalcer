import { Client } from "minio";

declare global {
  var __minioClient: Client | undefined;
}

const region = process.env.MINIO_REGION ?? "us-east-1";

export function getS3Client() {
  if (typeof window !== "undefined") {
    throw new Error("S3 client is server-only");
  }

  if (!globalThis.__minioClient) {
    globalThis.__minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT ?? "127.0.0.1",
      port: Number(process.env.MINIO_PORT ?? 9000),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY ?? "minio",
      secretKey: process.env.MINIO_SECRET_KEY ?? "minio123",
      region,
    });
  }

  return globalThis.__minioClient;
}

export const defaultPhotoBucket = process.env.MINIO_BUCKET ?? "photos";

export async function ensureBucketExists(bucket = defaultPhotoBucket) {
  const client = getS3Client();
  const exists = await client.bucketExists(bucket);

  if (!exists) {
    await client.makeBucket(bucket, region);
  }

  return bucket;
}
