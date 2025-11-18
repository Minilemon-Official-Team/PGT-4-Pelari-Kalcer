import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { usersTable } from "@/db/schema";

const newUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().int().min(0, "Age must be a positive integer"),
  email: z.string().email(),
});

export const listUsers = createServerFn({ method: "GET" }).handler(async () => {
  return db.select().from(usersTable).orderBy(asc(usersTable.id));
});

export const createUser = createServerFn({ method: "POST" })
  .inputValidator(newUserSchema)
  .handler(async ({ data }) => {
    const [user] = await db
      .insert(usersTable)
      .values(data)
      .onConflictDoNothing({ target: usersTable.email })
      .returning();

    return user ?? null;
  });

export const deleteUserByEmail = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    await db.delete(usersTable).where(eq(usersTable.email, data.email));
    return { success: true } as const;
  });
