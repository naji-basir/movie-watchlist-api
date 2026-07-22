import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";

import AppError from "../utils/AppError.ts";
import { Prisma } from "../generated/prisma/client.ts";

const handlePrismaKnownError = (
  err: Prisma.PrismaClientKnownRequestError,
): AppError => {
  // Unique constraint violation (e.g. duplicate email)
  if (err.code === "P2002") {
    const target = err.meta?.target as string[] | undefined;
    const field = target?.[0] || "field";
    return new AppError(`${field} already exists.`, 409);
  }
  // Record not found
  if (err.code === "P2025") {
    return new AppError("Resource not found.", 404);
  }
  return new AppError("Database error.", 400);
};

const handleJWTError = (): AppError =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = (): AppError =>
  new AppError("Your session has expired. Please log in again.", 401);

const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response): Response => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Unexpected/programming error — don't leak details
  console.error("UNEXPECTED ERROR:", err);
  return res.status(500).json({
    status: "error",
    message: "Something went wrong.",
  });
};

const globalErrorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let error: AppError;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaKnownError(err);
  } else if (err.name === "JsonWebTokenError") {
    error = handleJWTError();
  } else if (err.name === "TokenExpiredError") {
    error = handleJWTExpiredError();
  } else if (err instanceof AppError) {
    error = err;
  } else {
    error = new AppError(err.message || "Something went wrong.", 500);
  }

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
