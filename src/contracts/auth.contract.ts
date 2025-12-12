import { z } from "zod";

import { userEmailSchema, userNameSchema } from "@/contracts/users.contract";

export const registerContract = z.object({
  email: userEmailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: userNameSchema,
});

export const loginContract = z.object({
  email: userEmailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerContract>;
export type LoginInput = z.infer<typeof loginContract>;

export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;
