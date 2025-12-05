import {
  approveCreatorRequestContract,
  listOwnRequestsContract,
  rejectCreatorRequestContract,
  submitCreatorRequestContract
} from "@/contracts/creatorRequest.contract";
import { db } from "@/db";
import { creatorRequest, user } from "@/db/schema";
import { requireAdmin, requireMember } from "@/lib/auth-middleware";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

export const submitRequest = createServerFn({ method: "POST" })
  .middleware([requireMember])
  .inputValidator(submitCreatorRequestContract)
  .handler(async ({ data }) => {
    try {
      const newRequest = {
        userId: data.userId,
        portfolioLink: data.portfolioLink,
        motivation: data.motivation,
      };
      const result = await db
        .insert(creatorRequest)
        .values(newRequest)
        .returning({ insertedLink: creatorRequest.portfolioLink });

      return result[0];
    } catch (error) {
      console.log("Creator Request creation has failed");
    }
  });

export const approveRequest = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(approveCreatorRequestContract)
  .handler(async ({ data }) => {
    const { requesterId, requestId, reviewerId } = data;
    try {
      await db
        .update(creatorRequest)
        .set({ status: "approved", reviewedBy: reviewerId })
        .where(eq(creatorRequest.id, requestId));
      await db
        .update(user)
        .set({ role: "creator" })
        .where(eq(user.id, requesterId));
    } catch (error) {
      console.log("Creator Request approval has failed");
    }
  });

export const rejectRequest = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(rejectCreatorRequestContract)
  .handler(async ({ data }) => {
    const { requestId, reviewerId } = data;
    try {
      await db
        .update(creatorRequest)
        .set({ status: "rejected", reviewedBy: reviewerId })
        .where(eq(creatorRequest.id, requestId));
    } catch (error) {
      console.log("Creator Request rejection has failed");
    }
  });

export const listAllRequests = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const requests = await db
        .select({
          requesterId: user.id,
          requesterUsername: user.username,
          requestId: creatorRequest.id,
          portfolioLink: creatorRequest.portfolioLink,
        })
        .from(creatorRequest)
        .leftJoin(user, eq(creatorRequest.userId, user.id))
        .where(eq(creatorRequest.status, "pending"));

      return requests;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  },
);

export const listOwnRequests = createServerFn({ method: "GET" })
  .inputValidator(listOwnRequestsContract)
  .handler(async ({ data }) => {
    const {userId} = data;
    try {
      const requests = await db
        .select({
          requestId: creatorRequest.id,
          requesterUsername: user.username,
          portfolioLink: creatorRequest.portfolioLink,
          status: creatorRequest.status,
        })
        .from(creatorRequest)
        .leftJoin(user, eq(creatorRequest.userId, user.id))
        .where(eq(creatorRequest.userId, userId));

      return requests;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  });
