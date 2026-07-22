import { prisma } from "../config/db.ts";
import type { Prisma } from "../generated/prisma/client.ts";

export const watchlistRepository = {
  create(data: Prisma.WatchListItemUncheckedCreateInput) {
    return prisma.watchListItem.create({
      data,
      include: { movie: true },
    });
  },

  findById(id: string) {
    return prisma.watchListItem.findUnique({
      where: { id },
      include: { movie: true },
    });
  },

  findByUserAndMovie(userId: string, movieId: string) {
    return prisma.watchListItem.findUnique({
      where: { userId_movieId: { userId, movieId } },
    });
  },

  findMany(params: {
    skip: number;
    take: number;
    where: Prisma.WatchListItemWhereInput;
    orderBy: Prisma.WatchListItemOrderByWithRelationInput;
  }) {
    return prisma.watchListItem.findMany({
      ...params,
      include: { movie: true },
    });
  },

  count(where: Prisma.WatchListItemWhereInput) {
    return prisma.watchListItem.count({ where });
  },

  update(id: string, data: Prisma.WatchListItemUncheckedUpdateInput) {
    return prisma.watchListItem.update({
      where: { id },
      data,
      include: { movie: true },
    });
  },

  delete(id: string) {
    return prisma.watchListItem.delete({ where: { id } });
  },
};
