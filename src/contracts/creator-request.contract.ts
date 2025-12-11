import { z } from "zod";
import { userIdSchema } from "./users.contract";

export const portfolioLinkSchema = z.url("Portfolio URL must be a valid link");
export const motivationSchema = z.string().min(1, "Motivation must not be empty");
export const noteSchema = z.string();
export const statusSchema = z.enum(["pending", "approved", "rejected"]);
export const creatorRequestIdSchema = z.uuid();

export const submitCreatorRequestContract = z.object({
  portfolioLink: portfolioLinkSchema,
  motivation: motivationSchema,
});

export const approveCreatorRequestContract = z.object({
  userId: userIdSchema,
  requestId: creatorRequestIdSchema,
  note: noteSchema,
});

export const rejectCreatorRequestContract = z.object({
  requestId: creatorRequestIdSchema,
});
