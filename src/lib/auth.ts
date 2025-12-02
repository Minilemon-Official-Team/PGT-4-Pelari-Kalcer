import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/db";
import {
  account,
  claim,
  creatorRequest,
  event,
  photo,
  photoEmbedding,
  session,
  user,
  userEmbedding,
  verification,
} from "@/db/schema";
import { serverEnv } from "@/lib/env";

export const auth = betterAuth({
  baseUrl: serverEnv.BETTER_AUTH_URL,
  secret: serverEnv.BETTER_AUTH_SECRET,
  user: {
    fields: {
      name: "username",
    },
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "member",
        input: false, // don't allow user to set role
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
      creatorRequest,
      event,
      photo,
      photoEmbedding,
      userEmbedding,
      claim,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  trustedOrigins: [
    "http://localhost:3000", // Your local development environment
    "http://127.0.0.1:3000",
  ],
});
