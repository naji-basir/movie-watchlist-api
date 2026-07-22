import { z } from "zod";

export const registerSchema = z.object({
  body: z.strictObject({
    name: z.string().trim().min(2, "Name Required").max(100),
    email: z.email("Email required").trim(),
    password: z.string().min(8).max(100),
  }),
});

export const loginSchema = z.object({
  body: z.strictObject({
    email: z.email("Email required").trim(),
    password: z.string().min(1),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
