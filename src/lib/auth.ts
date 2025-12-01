import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "../db";
import { account, session, user, verification } from "../db/schema";

export const auth = betterAuth({
  user: {
    // modelName: 'users',
    additionalFields: {
      phone: {
        type: "string",
        required: false,
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
    "http://localhost:3000/", // Your local development environment
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3000/",
  ],
});
