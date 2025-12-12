import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import {
  approveCreatorRequestContract,
  rejectCreatorRequestContract,
  submitCreatorRequestContract,
} from "@/contracts/creator-request.contract";
import { db } from "@/db";
import { creatorRequest, user } from "@/db/schema";
import { requireAdmin, requireAuth, requireMember } from "@/lib/auth-middleware";

export const submitRequest = createServerFn({ method: "POST" })
  .middleware([requireMember])
  .inputValidator(submitCreatorRequestContract)
  .handler(async ({ data, context }) => {
    const newRequest = {
      userId: context.user.id,
      portfolioLink: data.portfolioLink,
      motivation: data.motivation,
    };

    const result = await db
      .insert(creatorRequest)
      .values(newRequest)
      .returning({ id: creatorRequest.id });

    return result[0];
  });

export const approveRequest = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(approveCreatorRequestContract)
  .handler(async ({ data, context }) => {
    const { userId, requestId, note } = data;

    await db.update(user).set({ role: "creator" }).where(eq(user.id, userId)).returning();
    await db
      .update(creatorRequest)
      .set({ status: "approved", reviewedBy: context.user.id, note })
      .where(eq(creatorRequest.id, requestId));
  });

export const rejectRequest = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(rejectCreatorRequestContract)
  .handler(async ({ data, context }) => {
    const { requestId, note } = data;

    await db
      .update(creatorRequest)
      .set({ status: "rejected", reviewedBy: context.user.id, note })
      .where(eq(creatorRequest.id, requestId));
  });

export const listAllPendingRequests = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const requests = await db
      .select({
        userId: creatorRequest.userId,
        name: user.username,
        id: creatorRequest.id,
        portfolioLink: creatorRequest.portfolioLink,
        motivation: creatorRequest.motivation,
        note: creatorRequest.note,
        createdAt: creatorRequest.createdAt,
        status: creatorRequest.status,
      })
      .from(creatorRequest)
      .leftJoin(user, eq(creatorRequest.userId, user.id))
      .where(eq(creatorRequest.status, "pending"))
      .orderBy(desc(creatorRequest.createdAt));

    return requests;
  });

export const listAllApprovedRequests = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const requests = await db
      .select({
        userId: creatorRequest.userId,
        name: user.username,
        id: creatorRequest.id,
        portfolioLink: creatorRequest.portfolioLink,
        motivation: creatorRequest.motivation,
        note: creatorRequest.note,
        createdAt: creatorRequest.createdAt,
        status: creatorRequest.status,
      })
      .from(creatorRequest)
      .leftJoin(user, eq(creatorRequest.userId, user.id))
      .where(eq(creatorRequest.status, "approved"))
      .orderBy(desc(creatorRequest.createdAt));

    return requests;
  });

export const listAllRejectedRequests = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const requests = await db
      .select({
        userId: creatorRequest.userId,
        name: user.username,
        id: creatorRequest.id,
        portfolioLink: creatorRequest.portfolioLink,
        motivation: creatorRequest.motivation,
        note: creatorRequest.note,
        createdAt: creatorRequest.createdAt,
        status: creatorRequest.status,
      })
      .from(creatorRequest)
      .leftJoin(user, eq(creatorRequest.userId, user.id))
      .where(eq(creatorRequest.status, "rejected"))
      .orderBy(desc(creatorRequest.createdAt));

    return requests;
  });

export const listOwnRequests = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const userId = context.user.id;

    const requests = await db
      .select({
        userId: creatorRequest.userId,
        id: creatorRequest.id,
        name: user.username,
        portfolioLink: creatorRequest.portfolioLink,
        motivation: creatorRequest.motivation,
        note: creatorRequest.note,
        createdAt: creatorRequest.createdAt,
        status: creatorRequest.status,
      })
      .from(creatorRequest)
      .leftJoin(user, eq(creatorRequest.userId, user.id))
      .where(eq(creatorRequest.userId, userId))
      .orderBy(desc(creatorRequest.createdAt));

    return requests;
  });
