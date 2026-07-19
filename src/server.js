import { config } from "dotenv";
import express from "express";
import { connetDB, disconnetDB } from "./config/db.js";
import movieRouter from "./routes/movie.routes.js";

config(); // load env vars before anything else uses them

const app = express();
app.use(express.json()); // read the json iknside body
const PORT = process.env.PORT || 5001;

// ROUTES
app.use("/movies", movieRouter);

let server;

async function startServer() {
  try {
    await connetDB();
    server = app.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}.`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    await disconnetDB();
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      await disconnetDB();
      console.log("DB connection closed.");
      process.exit(0); // exit without error
    });
  } else {
    await disconnetDB();
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown("SIGINT")); // Ctrl+C
process.on("SIGTERM", () => shutdown("SIGTERM")); // docker, kubernates stoop the server

process.on("unhandledRejection", async (reason) => {
  console.error("Unhandled Rejection:", reason);
  await disconnetDB();
  process.exit(1);
});

process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnetDB();
  process.exit(1);
});

startServer();
