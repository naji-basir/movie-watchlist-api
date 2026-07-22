import { z } from "zod";
export const movieIdSchema = z.uuid();
export const createMovieSchema = z.object({
  body: z.strictObject({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title is too long"),
    overview: z.string().trim().max(5000).optional(),
    releaseYear: z
      .int()
      .min(1888, "Invalid release year")
      .max(new Date().getFullYear() + 5),
    genres: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
    runtime: z.int().positive().optional(),
    posterUrl: z.url().optional(),
  }),
});

export const movieIdParamSchema = z.object({
  params: z.strictObject({ id: z.uuid() }),
});

export const getMoviesQuerySchema = z.object({
  query: z.strictObject({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(["title", "releaseYear", "createdAt"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
    genre: z.string().trim().optional(),
    releaseYear: z.coerce.number().int().optional(),
    search: z.string().trim().optional(),
  }),
});

export const updateMovieSchema = z.object({
  body: createMovieSchema.shape.body.partial(),
});

export type CreateMovieInput = z.infer<typeof createMovieSchema>["body"];
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>["body"];
export type GetMoviesQuery = z.infer<typeof getMoviesQuerySchema>["query"];
