import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import {
  type UserCreateInput,
  type UserUpdateInput,
  userCreateSchema,
  userIdSchema,
  userUpdateSchema,
} from "@/contracts/users.contract";
import { db } from "@/db";
import { usersTable } from "@/db/schema";

export const listUsers = createServerFn({ method: "GET" }).handler(async () => {
  return db.select().from(usersTable).orderBy(asc(usersTable.id));
});

export const createUser = createServerFn({ method: "POST" })
  .inputValidator(userCreateSchema)
  .handler(async ({ data }) => {
    const [user] = await db
      .insert(usersTable)
      .values(data satisfies UserCreateInput)
      .onConflictDoNothing({ target: usersTable.email })
      .returning();

    return user ?? null;
  });

export const updateUser = createServerFn({ method: "POST" })
  .inputValidator(userUpdateSchema)
  .handler(async ({ data }) => {
    const { id, ...rest } = data satisfies UserUpdateInput;
    const updates: Partial<UserCreateInput> = {};

    if (rest.name !== undefined) updates.name = rest.name;
    if (rest.email !== undefined) updates.email = rest.email;
    if (rest.age !== undefined) updates.age = rest.age;

    const [user] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, id))
      .returning();

    return user ?? null;
  });

export const deleteUser = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: userIdSchema }))
  .handler(async ({ data }) => {
    await db.delete(usersTable).where(eq(usersTable.id, data.id));
    return { success: true } as const;
  });
