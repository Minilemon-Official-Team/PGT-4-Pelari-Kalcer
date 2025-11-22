import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url("DATABASE_URL must be a valid connection string"),
});

const clientEnvSchema = z.object({
  VITE_APP_NAME: z.string(),
});

export const serverEnv = envSchema.parse(process.env);
export const clientEnv = clientEnvSchema.parse(import.meta.env);
