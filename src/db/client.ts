import { drizzle } from "drizzle-orm/bun-sql";

import { env } from "@/config/env.server";

if (typeof window !== "undefined") {
  throw new Error("Database client should not be imported in the browser");
}

type DrizzleClient = ReturnType<typeof drizzle>;

declare global {
  var __drizzleDb: DrizzleClient | undefined;
}

const client = globalThis.__drizzleDb ?? drizzle(env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") {
  globalThis.__drizzleDb = client;
}

export const db = client;
export type Database = typeof db;
