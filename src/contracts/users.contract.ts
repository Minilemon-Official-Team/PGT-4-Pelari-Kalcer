import { z } from "zod";

export const userIdSchema = z.string().min(1, "Id must not be empty");
export const userNameSchema = z.string().min(1, "Name is required").max(255);
export const userAgeSchema = z
  .number()
  .int()
  .min(0, "Age must be at least 0")
  .max(120, "Age looks suspicious");
export const userEmailSchema = z.email();
export const userPhoneSchema = z.e164();

export const userBaseSchema = z.object({
  id: userIdSchema,
  username: userNameSchema,
  email: userEmailSchema,
  phone: userPhoneSchema,
});

export const userCreateSchema = userBaseSchema.pick({ username: true, email: true });

export const userUpdateSchema = z
  .object({
    id: userIdSchema,
    username: userNameSchema.optional(),
    email: userEmailSchema.optional(),
    phone: userPhoneSchema.optional(),
  })
  .refine(
    (payload) =>
      payload.username !== undefined || payload.email !== undefined || payload.phone !== undefined,
    {
      message: "Provide at least one field to update",
      path: ["name"],
    },
  );

export type UserRecord = z.infer<typeof userBaseSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

export const USER_DEFAULT_AGE = 25;
