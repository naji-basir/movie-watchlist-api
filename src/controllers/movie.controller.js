import { prisma } from "../config/db";
import catchAsync from "../utils/catchAsync";

export const getAll = catchAsync(async (req, res) => {
  const movies = await prisma.movie.findMany();
  return res.status(200).json({ status: "success", data: { movies } });
});
