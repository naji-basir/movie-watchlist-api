import { prisma } from "../config/db";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";

export const addToWatchlist = catchAsync(async (req, res) => {
  const { movieId, status, rating, notes } = req.body;

  //varify movie
  const movie = await prisma.movie.findUnique({ where: { id: movieId } });

  if (!movie) {
    throw new AppError("Movie not found.", 404);
  }

  //check if movie already exist in watchlist
  const existingInWatchlist = await prisma.watchListItem.findUnique({
    where: {
      userId_movieId: {
        userId: req.user.id,
        movieId,
      },
    },
  });

  if (existingInWatchlist) {
    throw new AppError("Movie alreay in watchlist.", 400);
  }

  // add to watchlist
  const watchListItem = await prisma.watchListItem.create({
    data: {
      movieId,
      userId: req.user.id,
      status: status || "PLANNED",
      rating,
      notes,
    },
  });

  res.status(201).json({ status: "success", data: watchListItem });
});
