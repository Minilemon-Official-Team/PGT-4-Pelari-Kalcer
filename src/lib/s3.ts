import { S3Client } from "bun";

import { serverEnv } from "@/lib/env";

declare global {
  var __s3Client: S3Client | undefined;
}

const defaultRegion = serverEnv.S3_REGION;
export const defaultPhotoBucket = serverEnv.S3_BUCKET;
const accessKeyId = serverEnv.S3_ACCESS_KEY_ID;
const secretAccessKey = serverEnv.S3_SECRET_ACCESS_KEY;
const resolvedPort = serverEnv.S3_PORT;
const useSSL = serverEnv.S3_USE_SSL;
const endpointHost = serverEnv.S3_ENDPOINT;
const endpointPort = Number.isNaN(resolvedPort) ? "" : `:${resolvedPort}`;

const endpoint =
  serverEnv.S3_ENDPOINT_URL ?? `${useSSL ? "https" : "http"}://${endpointHost}${endpointPort}`;

export function getS3Client() {
  if (typeof window !== "undefined") {
    throw new Error("S3 client is server-only");
  }

  if (!globalThis.__s3Client) {
    globalThis.__s3Client = new S3Client({
      accessKeyId,
      secretAccessKey,
      bucket: defaultPhotoBucket,
      region: defaultRegion,
      endpoint,
    });
  }

  return globalThis.__s3Client;
}

function isMissingBucketError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    "code" in error &&
    (error as { name?: string }).name === "S3Error" &&
    (error as { code?: string }).code === "NoSuchBucket"
  );
}

export async function ensureBucketExists(bucket = defaultPhotoBucket) {
  const client = getS3Client();

  try {
    await client.list(undefined, { bucket });
    return bucket;
  } catch (error) {
    if (isMissingBucketError(error)) {
      throw new Error(
        `S3 bucket "${bucket}" is missing. Start the MinIO stack (\`bun run db:up\`) or create the bucket manually.`,
      );
    }

    throw error;
  }
}
