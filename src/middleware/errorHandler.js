import AppError from "../utils/AppError.js";

const handlePrismaKnownError = (err) => {
  // Unique constraint violation (e.g. duplicate email)
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "field";
    return new AppError(`${field} already exists.`, 409);
  }
  // Record not found
  if (err.code === "P2025") {
    return new AppError("Resource not found.", 404);
  }
  return new AppError("Database error.", 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your session has expired. Please log in again.", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
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

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = err;
    if (error.code && error.code.startsWith("P"))
      error = handlePrismaKnownError(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
