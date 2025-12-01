import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url("DATABASE_URL must be a valid connection string"),
  S3_ACCESS_KEY_ID: z.string().default("minio"),
  S3_SECRET_ACCESS_KEY: z.string().default("minio123"),
  S3_BUCKET: z.string().default("photos"),
  S3_REGION: z.string().default("us-east-1"),
  S3_ENDPOINT: z.string().default("127.0.0.1"),
  S3_PORT: z.coerce.number().default(9000),
  S3_USE_SSL: z.coerce.boolean().default(false),
  S3_ENDPOINT_URL: z.url("S3_ENDPOINT_URL must be a valid URL").optional(),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET should be at least 32 chars"),
  BETTER_AUTH_URL: z.url(),
});

const clientEnvSchema = z.object({
  VITE_APP_NAME: z.string(),
});

export const serverEnv = envSchema.parse(process.env);
export const clientEnv = clientEnvSchema.parse(import.meta.env);
