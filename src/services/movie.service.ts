import type { Prisma } from "../generated/prisma/client.ts";
import { movieRepository } from "../repositories/movie.repository.ts";
import AppError from "../utils/AppError.ts";
import type {
  CreateMovieInput,
  GetMoviesQuery,
  UpdateMovieInput,
} from "../validation/movie.validation.ts";

export const movieService = {
  async createMovie(userId: string, input: CreateMovieInput) {
    return movieRepository.create({
      ...input,
      createdBy: userId,
    });
  },

  async getMovieById(id: string) {
    const movie = await movieRepository.findById(id);
    if (!movie) {
      throw new AppError("Movie not found.", 404);
    }
    return movie;
  },

  async getMovies(query: GetMoviesQuery) {
    const { page, limit, sortBy, order, genre, releaseYear, search } = query;

    const where: Prisma.MovieWhereInput = {
      ...(genre && { genres: { has: genre } }),
      ...(releaseYear && { releaseYear }),
      ...(search && { title: { contains: search, mode: "insensitive" } }),
    };

    const [movies, total] = await Promise.all([
      movieRepository.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
        orderBy: { [sortBy]: order },
      }),
      movieRepository.count(where),
    ]);

    return {
      movies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateMovie(id: string, input: UpdateMovieInput) {
    await this.getMovieById(id); // throws 404 if missing
    return movieRepository.update(id, input);
  },

  async deleteMovie(id: string) {
    await this.getMovieById(id); // throws 404 if missing
    return movieRepository.delete(id);
  },
};
