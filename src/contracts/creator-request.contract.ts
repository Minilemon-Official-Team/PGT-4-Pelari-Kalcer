import { z } from "zod";
import { userIdSchema } from "./users.contract";

export const portfolioLinkSchema = z.url("Portfolio URL must be a valid link");
export const motivationSchema = z.string().min(1, "Reason for Application must not be empty");
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
  note: noteSchema,
});

export const creatorRequestSchema = z.object({
  id: creatorRequestIdSchema,
  userId: z.string(),
  status: statusSchema,
  portfolioLink: z.string().nullable(),
  motivation: motivationSchema.nullable(),
  reviewedBy: z.string().nullable(),
  note: noteSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const creatorRequestPopulatedSchema = creatorRequestSchema
  .pick({
    id: true,
    userId: true,
    status: true,
    portfolioLink: true,
    motivation: true,
    note: true,
    createdAt: true,
  })
  .extend({
    name: z.string().nullable(),
  });

export type CreatorRequest = z.infer<typeof creatorRequestSchema>;
export type CreatorRequestPopulated = z.infer<typeof creatorRequestPopulatedSchema>;
