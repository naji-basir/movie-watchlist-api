// middleware/restrictTo.ts
import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";

export const authorize =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(
        "You do not have permission to perform this action.",
        403,
      );
    }
    next();
  };
