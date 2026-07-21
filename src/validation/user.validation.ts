import { z } from "zod";

export const registerSchema = z.strictObject({
  name: z.string().trim().min(2, "Name Required").max(100),
  email: z.email().trim(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.strictObject({
  email: z.email().trim(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
