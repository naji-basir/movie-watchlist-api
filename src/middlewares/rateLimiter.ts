import rateLimit, { MINUTE } from "express-rate-limit";
import AppError from "../utils/AppError.ts";
import type { NextFunction } from "express";

export const globalLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, _res, next: NextFunction) => {
    next(new AppError("Too many requests, please try again later.", 429));
  },
});

// Stricter limiter for auth routes (login/register brute-force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, _res, next: NextFunction) => {
    next(new AppError("Too many login attempts, try again later.", 429));
  },
});
