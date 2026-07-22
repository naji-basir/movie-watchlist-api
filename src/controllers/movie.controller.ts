import type { Response } from "express";
import type { Request } from "express";
import catchAsync from "../utils/catchAsync.ts";
import AppError from "../utils/AppError.ts";
import { movieService } from "../services/movie.service.ts";
import type { GetMoviesQuery } from "../validation/movie.validation.ts";

export const createMovie = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Not authorized.", 401);
  }

  const movie = await movieService.createMovie(req.user.id, req.body);
  res.status(201).json({ status: "success", data: movie });
});

export const getMovie = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    throw new AppError("Invalid ID.", 400);
  }

  const movie = await movieService.getMovieById(id);
  res.status(200).json({ status: "success", data: movie });
});

export const getAllMovies = catchAsync(async (req: Request, res: Response) => {
  const query = req.validated?.query as GetMoviesQuery;
  const { movies, meta } = await movieService.getMovies(query);
  res.status(200).json({ status: "success", data: movies, meta });
});

export const updateMovie = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    throw new AppError("Invalid ID.", 400);
  }

  const movie = await movieService.updateMovie(id, req.body);
  res.status(200).json({ status: "success", data: movie });
});

export const deleteMovie = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    throw new AppError("Invalid ID.", 400);
  }

  await movieService.deleteMovie(id);
  res.status(204).send();
});
