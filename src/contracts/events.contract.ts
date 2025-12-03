import { z } from "zod";

export const eventIdSchema = z.string().uuid("Invalid event ID format");

export const eventNameSchema = z
  .string()
  .min(1, "Event name is required")
  .max(160, "Event name must be 160 characters or less");

export const eventDescriptionSchema = z
  .string()
  .max(2000, "Description must be 2000 characters or less")
  .nullable()
  .optional();

export const eventLocationSchema = z
  .string()
  .max(500, "Location must be 500 characters or less")
  .nullable()
  .optional();

export const eventImageSchema = z.string().url("Invalid image URL").nullable().optional();

export const eventStartsAtSchema = z.coerce.date().nullable().optional();

export const eventVisibilitySchema = z.enum(["public", "unlisted"]);

export const eventCreateSchema = z.object({
  name: eventNameSchema,
  description: eventDescriptionSchema,
  location: eventLocationSchema,
  image: eventImageSchema,
  startsAt: eventStartsAtSchema,
  visibility: eventVisibilitySchema.default("public"),
});

export const eventUpdateSchema = z
  .object({
    name: eventNameSchema.optional(),
    description: eventDescriptionSchema,
    location: eventLocationSchema,
    image: eventImageSchema,
    startsAt: eventStartsAtSchema,
    visibility: eventVisibilitySchema.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided for update",
  });

export const eventListQuerySchema = z.object({
  visibility: eventVisibilitySchema.optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: eventIdSchema.optional(),
});

export const eventRecordSchema = z.object({
  id: eventIdSchema,
  name: eventNameSchema,
  description: z.string().nullable(),
  location: z.string().nullable(),
  image: z.string().nullable(),
  startsAt: z.coerce.date().nullable(),
  visibility: eventVisibilitySchema,
  createdBy: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type EventId = z.infer<typeof eventIdSchema>;
export type EventCreate = z.infer<typeof eventCreateSchema>;
export type EventUpdate = z.infer<typeof eventUpdateSchema>;
export type EventListQuery = z.infer<typeof eventListQuerySchema>;
export type EventRecord = z.infer<typeof eventRecordSchema>;
