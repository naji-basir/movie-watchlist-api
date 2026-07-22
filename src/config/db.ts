import "dotenv/config"; // must be the very first line in this file

// import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client.ts";
import { logger } from "../utils/logger.ts";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["error", "warn", "info"]
      : ["error"],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info("DB connected via Prisma.");
  } catch (error: any) {
    logger.error(error, "Database connection error");
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
};

export { prisma, connectDB, disconnectDB };
