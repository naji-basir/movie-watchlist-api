import type { Request, Response } from "express";
import { prisma } from "../config/db.ts";
import catchAsync from "../utils/catchAsync.ts";

export const getAll = catchAsync(async (req: Request, res: Response) => {
  const movies = await prisma.movie.findMany();
  return res.status(200).json({ status: "success", data: { movies } });
});
