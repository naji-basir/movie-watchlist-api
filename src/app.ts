import { config } from "dotenv";
config(); // Must run before any oth  er import touches process.env
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";

import cookieParser from "cookie-parser";
import helmet from "helmet";
import { connectDB, disconnectDB } from "./config/db.ts";
import globalErrorHandler from "./middlewares/globalErrorHandler.ts";
import authRoutes from "./routes/auth.routes.ts";
import movieRoutes from "./routes/movie.routes.ts";
import watchlistRoutes from "./routes/watchlist.routes.ts";

import { globalLimiter } from "./middlewares/rateLimiter.ts";
import AppError from "./utils/AppError.ts";
import { httpLogger } from "./middlewares/httpLogger.ts";
import { logger } from "./utils/logger.ts";

const app: Express = express();

// --- Global middleware ---
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(globalLimiter);
app.use(httpLogger);

// --- Routes ---
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" });
});
app.use("/api/v1/movies", movieRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/watchlist", watchlistRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5002;
let server: any;

async function startServer() {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      logger.info(`Server running on PORT ${PORT}.`);
    });
  } catch (err) {
    logger.error(err, "Failed to start server");
    await disconnectDB();
    process.exit(1);
  }
}

async function shutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed.");
      await disconnectDB();
      logger.info("DB connection closed.");
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.error(reason, "Unhandled Rejection");
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  logger.error(err, "Uncaught Exception");
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

startServer();
