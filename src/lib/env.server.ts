import { z } from "zod";

if (typeof window !== "undefined") {
  throw new Error("env.server.ts should only be imported on the server");
}

const schema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),
});

export const env = schema.parse(process.env);
