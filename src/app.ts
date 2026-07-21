import { config } from "dotenv";
config(); // Must run before any other import touches process.env
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";

import helmet from "helmet";
import { connectDB, disconnectDB } from "./config/db.ts";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./middleware/errorHandler.ts";
import authRoutes from "./routes/auth.routes.ts";
import movieRoutes from "./routes/movie.routes.ts";
import watchlistRoutes from "./routes/watchlist.routes.ts";

import AppError from "./utils/AppError.ts";

const app: Express = express();

// --- Global middleware ---
app.use(helmet()); // sets secure HTTP headers (XSS, sniffing, etc.)
app.use(express.json({ limit: "10kb" })); // parses JSON request bodies
app.use(express.urlencoded({ extended: true, limit: "10kb" })); // parses form-encoded bodies
app.use(cookieParser()); // populates req.cookies, needed to read the jwt cookie in auth middleware

if (process.env.NODE_ENV === "development") {
  app.use(morgan("tiny"));
}

// --- Routes ---
app.use("/api/v1/movies", movieRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/watchlist", watchlistRoutes);

// Catches any request that didn't match a route above.
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
      console.log(`Server running on PORT ${PORT}.`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    await disconnectDB();
    process.exit(1);
  }
}

// Closes the HTTP server (letting in-flight requests finish) before closing the DB and exiting, rather than killing the process immediately.
async function shutdown(signal: any) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      await disconnectDB();
      console.log("DB connection closed.");
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown("SIGINT")); // Ctrl+C locally
process.on("SIGTERM", () => shutdown("SIGTERM")); // sent by Docker/Kubernetes/hosting platforms on stop

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

startServer();
