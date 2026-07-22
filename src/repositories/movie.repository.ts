import { prisma } from "../config/db.ts";
import type { Prisma } from "../generated/prisma/client.ts";

export const movieRepository = {
  create(data: Prisma.MovieUncheckedCreateInput) {
    return prisma.movie.create({ data });
  },

  findById(id: string) {
    return prisma.movie.findUnique({
      where: { id },
      include: { creator: { select: { id: true, name: true } } },
    });
  },

  findMany(params: {
    skip: number;
    take: number;
    where: Prisma.MovieWhereInput;
    orderBy: Prisma.MovieOrderByWithRelationInput;
  }) {
    return prisma.movie.findMany({
      ...params,
      include: { creator: { select: { id: true, name: true } } },
    });
  },

  count(where: Prisma.MovieWhereInput) {
    return prisma.movie.count({ where });
  },

  update(id: string, data: Prisma.MovieUncheckedUpdateInput) {
    return prisma.movie.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.movie.delete({ where: { id } });
  },
};
