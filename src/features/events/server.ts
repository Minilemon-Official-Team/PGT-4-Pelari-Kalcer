import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import {
  type EventCreate,
  type EventListQuery,
  type EventUpdate,
  eventCreateSchema,
  eventIdSchema,
  eventListQuerySchema,
  eventUpdateSchema,
} from "@/contracts/events.contract";
import { db } from "@/db";
import { event } from "@/db/schema";
import { requireAdmin } from "@/lib/middleware";

export const getEvents = createServerFn({ method: "GET" })
  .inputValidator((data: EventListQuery) => eventListQuerySchema.parse(data))
  .handler(async ({ data }) => {
    const { visibility, limit } = data;

    const query = db
      .select()
      .from(event)
      .orderBy(desc(event.startsAt), desc(event.createdAt))
      .limit(limit);

    if (visibility) {
      return await query.where(eq(event.visibility, visibility));
    }

    // Default: only show public events for unauthenticated users
    return await query.where(eq(event.visibility, "public"));
  });

export const getEventById = createServerFn({ method: "GET" })
  .inputValidator((data: string) => eventIdSchema.parse(data))
  .handler(async ({ data: eventId }) => {
    const result = await db.select().from(event).where(eq(event.id, eventId)).limit(1);

    if (result.length === 0) {
      throw new Error("Event not found");
    }

    return result[0];
  });

export const createEvent = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: EventCreate) => eventCreateSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { user } = context;

    const result = await db
      .insert(event)
      .values({
        ...data,
        createdBy: user.id,
      })
      .returning();

    return result[0];
  });

export const updateEvent = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: { eventId: string; updates: EventUpdate }) => ({
    eventId: eventIdSchema.parse(data.eventId),
    updates: eventUpdateSchema.parse(data.updates),
  }))
  .handler(async ({ data }) => {
    const { eventId, updates } = data;

    const result = await db.update(event).set(updates).where(eq(event.id, eventId)).returning();

    if (result.length === 0) {
      throw new Error("Event not found");
    }

    return result[0];
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: string) => eventIdSchema.parse(data))
  .handler(async ({ data: eventId }) => {
    const result = await db.delete(event).where(eq(event.id, eventId)).returning();

    if (result.length === 0) {
      throw new Error("Event not found");
    }

    return { success: true, deletedId: eventId };
  });
