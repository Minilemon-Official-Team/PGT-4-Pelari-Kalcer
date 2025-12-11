import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import {
  approveCreatorRequestContract,
  rejectCreatorRequestContract,
  submitCreatorRequestContract,
} from "@/contracts/creator-request.contract";
import { db } from "@/db";
import { creatorRequest, user } from "@/db/schema";
import { getAuthSession } from "@/lib/auth-actions";
import { requireAdmin, requireMember } from "@/lib/auth-middleware";

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
    try {
      await db.update(user).set({ role: "creator" }).where(eq(user.id, userId)).returning();
      await db
        .update(creatorRequest)
        .set({ status: "approved", reviewedBy: context.user.id, note })
        .where(eq(creatorRequest.id, requestId));
    } catch (error) {
      if (error instanceof Error) console.log(error.message);
    }
  });

export const rejectRequest = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(rejectCreatorRequestContract)
  .handler(async ({ data, context }) => {
    const { requestId, note } = data;
    try {
      await db
        .update(creatorRequest)
        .set({ status: "rejected", reviewedBy: context.user.id, note })
        .where(eq(creatorRequest.id, requestId));
    } catch (error) {
      if (error instanceof Error) console.log("Creator request rejection has failed");
    }
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
        submittedAt: creatorRequest.createdAt,
        status: creatorRequest.status,
      })
      .from(creatorRequest)
      .leftJoin(user, eq(creatorRequest.userId, user.id))
      .where(eq(creatorRequest.status, "pending"));

    return requests;
  });

export const listAllApprovedRequests = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const requests = await db
      .select({
        name: user.username,
        id: creatorRequest.id,
        portfolioLink: creatorRequest.portfolioLink,
        motivation: creatorRequest.motivation,
        note: creatorRequest.note,
        submittedAt: creatorRequest.createdAt,
        status: creatorRequest.status,
      })
      .from(creatorRequest)
      .leftJoin(user, eq(creatorRequest.userId, user.id))
      .where(eq(creatorRequest.status, "approved"));

    return requests;
  });

export const listAllRejectedRequests = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const requests = await db
      .select({
        name: user.username,
        id: creatorRequest.id,
        portfolioLink: creatorRequest.portfolioLink,
        motivation: creatorRequest.motivation,
        note: creatorRequest.note,
        submittedAt: creatorRequest.createdAt,
        status: creatorRequest.status,
      })
      .from(creatorRequest)
      .leftJoin(user, eq(creatorRequest.userId, user.id))
      .where(eq(creatorRequest.status, "rejected"));

    return requests;
  });

export const listOwnRequests = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAuthSession();
  if (!session?.user) {
    throw new Error("Unauthenticated: please login first");
  }
  const userId = session.user.id ?? "";

  const requests = await db
    .select({
      id: creatorRequest.id,
      name: user.username,
      portfolioLink: creatorRequest.portfolioLink,
      motivation: creatorRequest.motivation,
      note: creatorRequest.note,
      submittedAt: creatorRequest.createdAt,
      status: creatorRequest.status,
    })
    .from(creatorRequest)
    .leftJoin(user, eq(creatorRequest.userId, user.id))
    .where(eq(creatorRequest.userId, userId));

  return requests;
});
