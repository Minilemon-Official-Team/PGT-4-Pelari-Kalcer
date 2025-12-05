import { z } from "zod";
import { userIdSchema } from "./users.contract";

export const portfolioLinkSchema = z.url("Portfolio URL must be a valid link");
export const motivationSchema = z.string();
export const statusSchema = z.enum(["pending", "approved", "rejected"]);
export const creatorRequestIdSchema = z.uuid()

export const submitCreatorRequestContract = z.object({
  userId: userIdSchema,
  portfolioLink: portfolioLinkSchema,
  motivation: motivationSchema,
});

export const approveCreatorRequestContract = z.object({
  requesterId: userIdSchema,
  requestId: creatorRequestIdSchema,
  reviewerId: userIdSchema,
});

export const rejectCreatorRequestContract = z.object({
  requestId: creatorRequestIdSchema,
  reviewerId: userIdSchema,
});

export const listOwnRequestsContract = z.object({
  userId: userIdSchema,
});
