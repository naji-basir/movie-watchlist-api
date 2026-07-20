import "dotenv/config"; // must be the very first line in this file

import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

const connetDB = async () => {
  try {
    await prisma.$connect();
    console.log("DB connected via Prisma.");
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

const disconnetDB = async () => {
  await prisma.$disconnect();
};

export { prisma, connetDB, disconnetDB };
