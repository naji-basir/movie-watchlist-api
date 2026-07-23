import { z } from "zod";

const registerBody = z
  .strictObject({
    name: z
      .string()
      .trim()
      .min(2, "Name Required")
      .max(100)
      .meta({
        title: "Name",
        description: "User's full name",
        examples: [""],
      }),
    email: z
      .email("Email required")
      .trim()
      .meta({
        title: "Email",
        description: "User's email address",
        examples: [""],
      }),
    password: z
      .string()
      .min(8)
      .max(100)
      .meta({
        title: "Password",
        description: "Password, minimum 8 characters",
        examples: [""],
      }),
  })
  .meta({ id: "RegisterInput" });

const loginBody = z
  .strictObject({
    email: z
      .email("Email required")
      .trim()
      .meta({
        examples: [""],
      }),
    password: z
      .string()
      .min(1)
      .meta({
        title: "Password",
        description: "Password, minimum 8 characters",
        examples: [""],
      }),
  })
  .meta({ id: "LoginInput" });

// --- Response schemas (match actual controller output) ---

const registerResponse = z
  .object({
    status: z.literal("success"),
    data: z.object({
      user: z.object({
        id: z.uuid(),
        name: z.string(),
        email: z.email().meta({ example: ["example@gmail.com"] }),
      }),
    }),
    token: z.string().meta({
      description: "JWT (also set as httpOnly cookie)",
      examples: [
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE4ZThjMGI4In0.abc123",
      ],
    }),
  })
  .meta({ id: "RegisterResponse" });

const loginResponse = z
  .object({
    status: z.literal("success"),
    message: z.string(),
    data: z.object({
      user: z.object({
        id: z.uuid(),
        email: z.email().meta({ example: ["example@gmail.com"] }),
      }),
    }),
    token: z.string().meta({
      description: "JWT (also set as httpOnly cookie)",
      examples: [
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE4ZThjMGI4In0.abc123",
      ],
    }),
  })
  .meta({ id: "LoginResponse" });

const logoutResponse = z
  .object({
    status: z.literal("success"),
    message: z.string(),
  })
  .meta({ id: "LogoutResponse" });

const errorResponse = z
  .object({
    status: z.literal("error"),
    message: z.string(),
  })
  .meta({ id: "ErrorResponse" });

export const loginSchema = z.object({ body: loginBody });
export const registerSchema = z.object({ body: registerBody });

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];

// exported for openapi.ts
export {
  registerBody,
  loginBody,
  registerResponse,
  loginResponse,
  logoutResponse,
  errorResponse,
};
