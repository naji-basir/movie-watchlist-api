import { prisma } from "../config/db";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import jwt from "jsonwebtoken";

export const authMiddleware = catchAsync(async (req, res, next) => {
  let token;
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

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user) {
    throw new AppError("User no longer exist.", 401);
  }

  req.user = user;
  next();
});
