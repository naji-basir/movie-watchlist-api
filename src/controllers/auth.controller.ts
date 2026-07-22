import catchAsync from "../utils/catchAsync.ts";
import { authService } from "../services/auth.service.ts";
import type { Request, Response } from "express";

// Helper specific to HTTP responses
const setAuthCookie = (res: Response, token: string) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const { user, token } = await authService.register(name, email, password);
  setAuthCookie(res, token);
  return res.status(201).json({
    status: "success",
    data: { user },
    token,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login(email, password);
  setAuthCookie(res, token);

  return res.status(200).json({
    status: "success",
    message: "Login successful",
    data: { user },
    token,
  });
});

export const logout = (req: Request, res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });

  res.status(200).json({ status: "success", message: "Logout successfully." });
};
