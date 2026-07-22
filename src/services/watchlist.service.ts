import { watchlistRepository } from "../repositories/watchlist.repository.ts";
import { movieRepository } from "../repositories/movie.repository.ts";
import AppError from "../utils/AppError.js";
import type {
  AddToWatchlistInput,
  UpdateWatchlistItemInput,
  GetWatchlistQuery,
} from "../validation/watchlist.validation.ts";
import type { Prisma, Role } from "../generated/prisma/client.ts";

export const watchlistService = {
  async addToWatchlist(userId: string, input: AddToWatchlistInput) {
    const movie = await movieRepository.findById(input.movieId);
    if (!movie) {
      throw new AppError("Movie not found.", 404);
    }

    const existing = await watchlistRepository.findByUserAndMovie(
      userId,
      input.movieId,
    );
    if (existing) {
      throw new AppError("Movie already in watchlist.", 409);
    }

    return watchlistRepository.create({ ...input, userId });
  },

  async getWatchlistItemForUser(id: string, userId: string) {
    const item = await watchlistRepository.findById(id);
    if (!item) {
      throw new AppError("Watchlist item not found.", 404);
    }
    if (item.userId !== userId) {
      throw new AppError("Not allowed to access this watchlist item.", 403);
    }

    return item;
  },

  async getWatchlist(userId: string, query: GetWatchlistQuery) {
    const { page, limit, sortBy, order, status } = query;

    const where: Prisma.WatchListItemWhereInput = {
      userId,
      ...(status && { status }),
    };

    const [items, total] = await Promise.all([
      watchlistRepository.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
        orderBy: { [sortBy]: order },
      }),
      watchlistRepository.count(where),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async updateWatchlistItem(
    id: string,
    userId: string,
    input: UpdateWatchlistItemInput,
  ) {
    await this.getWatchlistItemForUser(id, userId);
    return watchlistRepository.update(id, input);
  },

  async removeFromWatchlist(id: string, userId: string) {
    await this.getWatchlistItemForUser(id, userId);
    return watchlistRepository.delete(id);
  },
};
