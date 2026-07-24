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
import globalErrorHandler from "./middlewares/globalErrorHandler.ts";
import authRoutes from "./routes/auth.routes.ts";
import movieRoutes from "./routes/movie.routes.ts";
import watchlistRoutes from "./routes/watchlist.routes.ts";

import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./docs/openapi.ts";
import { httpLogger } from "./middlewares/httpLogger.ts";
import { globalLimiter } from "./middlewares/rateLimiter.ts";
import AppError from "./utils/AppError.ts";

const app: Express = express();

// Global middleware
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(globalLimiter);
app.use(httpLogger);

// Routes
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" });
});
app.use("/api/v1/movies", movieRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/watchlist", watchlistRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.get("/openapi.json", (_req, res) => res.json(openApiDocument));

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
});

app.use(globalErrorHandler);
export default app;
