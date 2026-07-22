import crypto from "node:crypto";
import { pinoHttp } from "pino-http";
import { logger } from "../utils/logger.ts";
import type { Request, Response } from "express";

export const httpLogger = pinoHttp({
  logger,

  genReqId: () => crypto.randomUUID(),

  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  customSuccessMessage: (req: Request, res: Response, responseTime: number) =>
    `${req.method} ${req.originalUrl} → ${res.statusCode} (${responseTime} ms)`,

  customErrorMessage: (req: Request, res: Response, err: Error) =>
    `${req.method} ${req.originalUrl} → ${res.statusCode} (${err.message})`,

  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.originalUrl,
      remoteAddress: req.remoteAddress,
    }),

    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },

  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "req.headers['x-api-key']",
    "req.body.password",
    "req.body.confirmPassword",
    "req.body.token",
    'res.headers["set-cookie"]',
  ],
});
