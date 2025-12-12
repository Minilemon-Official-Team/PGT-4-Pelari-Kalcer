import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { userUpdateSchema } from "@/contracts/users.contract";
import { db } from "@/db";
import { user } from "@/db/schema";
import { requireAuth } from "@/lib/auth-middleware";

export const updateUserProfile = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((data) => userUpdateSchema.parse(data))
  .handler(async ({ context, data }) => {
    const userId = context.user.id;

    const updates: Partial<typeof user.$inferInsert> = {
      ...(data.username !== undefined && { username: data.username.trim() }),
      ...(data.email !== undefined && { email: data.email.trim().toLowerCase() }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
    };

    if (Object.keys(updates).length === 0) {
      throw new Response("No changes provided", { status: 400 });
    }

    try {
      const [updated] = await db
        .update(user)
        .set(updates)
        .where(eq(user.id, userId))
        .returning({ id: user.id, username: user.username, email: user.email, phone: user.phone });

      if (!updated) {
        throw new Response("User not found", { status: 404 });
      }

      return { user: updated };
    } catch (error) {
      if (error instanceof Error && /unique/i.test(error.message)) {
        throw new Response("Username or email already in use", { status: 409 });
      }
      throw error;
    }
  });
