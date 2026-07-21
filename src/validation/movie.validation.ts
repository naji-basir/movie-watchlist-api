import { z } from "zod";
export const movieIdSchema = z.uuid();
export const createMovieSchema = z.strictObject({
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
});

export const updateMovieSchema = createMovieSchema.partial();
export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;
