import { S3Client } from "bun";

declare global {
  var __s3Client: S3Client | undefined;
}

const defaultRegion = process.env.MINIO_REGION ?? "us-east-1";
export const defaultPhotoBucket = process.env.MINIO_BUCKET ?? "photos";
const accessKeyId = process.env.MINIO_ACCESS_KEY ?? "minio";
const secretAccessKey = process.env.MINIO_SECRET_KEY ?? "minio123";
const resolvedPort = Number(process.env.MINIO_PORT ?? 9000);
const useSSL = (process.env.MINIO_USE_SSL ?? "false").toLowerCase() === "true";
const endpointHost = process.env.MINIO_ENDPOINT ?? "127.0.0.1";
const endpointPort = Number.isNaN(resolvedPort) ? "" : `:${resolvedPort}`;

const endpoint =
  process.env.MINIO_ENDPOINT_URL ?? `${useSSL ? "https" : "http"}://${endpointHost}${endpointPort}`;

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
