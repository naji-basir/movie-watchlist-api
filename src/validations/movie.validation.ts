import { z } from "zod";

export const movieIdSchema = z.uuid();

const createMovieBody = z
  .strictObject({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title is too long")
      .meta({ description: "Movie title", examples: ["Inception"] }),
    overview: z
      .string()
      .trim()
      .max(5000)
      .optional()
      .meta({ description: "Short synopsis" }),
    releaseYear: z
      .int()
      .min(1888, "Invalid release year")
      .max(new Date().getFullYear() + 5)
      .meta({ description: "Year of release", examples: [2010] }),
    genres: z
      .array(z.string().trim().min(1).max(40))
      .max(10)
      .default([])
      .meta({ examples: [["Sci-Fi", "Thriller"]] }),
    runtime: z
      .int()
      .positive()
      .optional()
      .meta({ description: "Runtime in minutes", examples: [148] }),
    posterUrl: z.url().optional().meta({ description: "Poster image URL" }),
  })
  .meta({ id: "CreateMovieInput" });

const movieIdParams = z
  .strictObject({ id: z.uuid().meta({ description: "Movie ID" }) })
  .meta({ id: "MovieIdParam" });

const getMoviesQuery = z
  .strictObject({
    page: z.coerce
      .number()
      .int()
      .positive()
      .default(1)
      .meta({ examples: [1] }),
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .default(20)
      .meta({ examples: [20] }),
    sortBy: z.enum(["title", "releaseYear", "createdAt"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
    genre: z.string().trim().optional(),
    releaseYear: z.coerce.number().int().optional(),
    search: z.string().trim().optional(),
  })
  .meta({ id: "GetMoviesQuery" });

export const movieIdParamSchema = z.object({ params: movieIdParams });
export const getMoviesQuerySchema = z.object({ query: getMoviesQuery });

const updateMovieBody = createMovieBody
  .partial()
  .meta({ id: "UpdateMovieInput" });

export const createMovieSchema = z.object({ body: createMovieBody });
export const updateMovieSchema = z.object({ body: updateMovieBody });

export type CreateMovieInput = z.infer<typeof createMovieSchema>["body"];
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>["body"];
export type GetMoviesQuery = z.infer<typeof getMoviesQuerySchema>["query"];

// exported for openapi.ts
export { createMovieBody, movieIdParams, getMoviesQuery, updateMovieBody };
