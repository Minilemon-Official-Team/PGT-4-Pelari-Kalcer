import { z } from "zod";

// Shared contracts describing the photo entity and upload workflow.
export const photoIdSchema = z.uuid();
export const eventIdSchema = z.uuid();
export const uploaderIdSchema = z.uuid();

export const photoStatusSchema = z.enum([
  "uploaded",
  "processing",
  "ready",
  "failed",
  "deleting",
  "deleted",
]);

export const photoRecordSchema = z.object({
  id: photoIdSchema,
  eventId: eventIdSchema,
  uploaderId: uploaderIdSchema,
  objectKey: z.string().min(1),
  storageBucket: z.string().min(1),
  mimeType: z.string().min(1).nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  facesCount: z.number().int().nonnegative(),
  status: photoStatusSchema,
  processedAt: z.coerce.date().nullable(),
  deleteAfter: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const photoUploadRequestSchema = z.object({
  eventId: eventIdSchema,
  fileName: z.string().min(3, "Filename too short"),
  mimeType: z.string().min(1, "Missing MIME type"),
  byteSize: z
    .number()
    .int()
    .positive()
    .max(50 * 1024 * 1024, "File exceeds 50MB limit"),
});

export const photoFeedQuerySchema = z.object({
  eventId: eventIdSchema.optional(),
  status: photoStatusSchema.optional(),
  limit: z.number().int().positive().max(100).default(20),
  cursor: photoIdSchema.optional(),
});

export type PhotoRecord = z.infer<typeof photoRecordSchema>;
export type PhotoUploadRequest = z.infer<typeof photoUploadRequestSchema>;
export type PhotoFeedQuery = z.infer<typeof photoFeedQuerySchema>;
