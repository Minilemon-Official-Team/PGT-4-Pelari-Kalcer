import { z } from "zod";

export const userIdSchema = z.string().min(1, "Id must not be empty");
export const userNameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(24, "Username must be at most 24 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");
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
  phone: userPhoneSchema.optional().nullable(),
});

export const userCreateSchema = userBaseSchema.pick({ username: true, email: true });

export const userUpdateSchema = z
  .object({
    username: userNameSchema.optional(),
    email: userEmailSchema.optional(),
    phone: userPhoneSchema.optional().nullable(),
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

export const userProfileSchema = userBaseSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
  role: z.enum(["member", "admin", "creator"]),
  image: z.string().nullable().optional(),
  emailVerified: z.boolean().default(false),
  banned: z.boolean().optional().default(false),
  banReason: z.string().nullable().optional(),
  banExpires: z.date().nullable().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
