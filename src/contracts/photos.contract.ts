import { z } from "zod";

// Shared contracts describing the photo entity and upload workflow.
export const photoIdSchema = z.uuid();
export const eventIdSchema = z.uuid();
export const uploaderIdSchema = z.string();

export const photoStatusSchema = z.enum([
  "pending",
  "processing",
  "ready",
  "failed",
  "hidden",
  "deleted",
]);

export const photoRecordSchema = z.object({
  id: photoIdSchema,
  eventId: eventIdSchema.nullable(),
  uploaderId: uploaderIdSchema,
  originalName: z.string().nullable(),
  storagePathRaw: z.string(),
  storagePathDisplay: z.string().nullable(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  takenAt: z.coerce.date().nullable(),
  status: photoStatusSchema,
  retryCount: z.number().int().default(0),
  processingError: z.string().nullable(),
  facesCount: z.number().int().default(0),
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
