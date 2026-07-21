import type { ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";

export const validate =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const message = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", ");
      throw new AppError(message, 400);
    }

    next();
  };
