import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db.ts";
import AppError from "../utils/AppError.ts";
import catchAsync from "../utils/catchAsync.ts";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const authenticate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new AppError("Not authorized.", 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded.id) {
      throw new AppError("Invalid token payload.", 401);
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      throw new AppError("User no longer exist.", 401);
    }

    req.user = user;
    next();
  },
);
