import { config } from "dotenv";
config(); // Must run before any oth  er import touches process.env
import { logger } from "../utils/logger.ts";
import { connectDB, disconnectDB } from "./db.ts";
import app from "../app.ts";

const PORT = process.env.PORT || 5002;
let server: any;
export default async function startServer() {
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
