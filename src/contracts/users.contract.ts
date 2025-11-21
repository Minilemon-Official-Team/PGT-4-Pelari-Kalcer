import { z } from "zod";

export const userIdSchema = z.number().int().positive();
export const userNameSchema = z.string().min(1, "Name is required").max(255);
export const userAgeSchema = z
  .number()
  .int()
  .min(0, "Age must be at least 0")
  .max(120, "Age looks suspicious");
export const userEmailSchema = z.email();

export const userBaseSchema = z.object({
  id: userIdSchema,
  name: userNameSchema,
  age: userAgeSchema,
  email: userEmailSchema,
});

export const userCreateSchema = userBaseSchema.pick({ name: true, age: true, email: true });

export const userUpdateSchema = z
  .object({
    id: userIdSchema,
    name: userNameSchema.optional(),
    age: userAgeSchema.optional(),
    email: userEmailSchema.optional(),
  })
  .refine(
    (payload) =>
      payload.name !== undefined || payload.age !== undefined || payload.email !== undefined,
    {
      message: "Provide at least one field to update",
      path: ["name"],
    },
  );

export type UserRecord = z.infer<typeof userBaseSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

export const USER_DEFAULT_AGE = 25;
