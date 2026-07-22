import { z } from "zod";

const statusEnum = z.enum(["PLANNED", "WATCHING", "COMPLETED", "DROPPED"]);

export const addToWatchlistSchema = z.object({
  body: z.strictObject({
    movieId: z.uuid(),
    status: statusEnum.default("PLANNED"),
    rating: z.coerce.number().int().min(1).max(10).optional(),
    notes: z.string().trim().max(1000).optional(),
  }),
});

export const updateWatchlistItemSchema = z.object({
  params: z.strictObject({ id: z.uuid() }),
  body: z
    .strictObject({
      status: statusEnum,
      rating: z.coerce.number().int().min(1).max(10).nullable(),
      notes: z.string().trim().max(1000).nullable(),
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      error: "At least one field must be provided.",
    }),
});

export const watchlistItemIdParamSchema = z.object({
  params: z.strictObject({ id: z.uuid() }),
});

export const getWatchlistQuerySchema = z.object({
  query: z.strictObject({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(["createdAt", "updatedAt", "rating"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
    status: statusEnum.optional(),
  }),
});

export type AddToWatchlistInput = z.infer<typeof addToWatchlistSchema>["body"];
export type UpdateWatchlistItemInput = z.infer<
  typeof updateWatchlistItemSchema
>["body"];
export type GetWatchlistQuery = z.infer<
  typeof getWatchlistQuerySchema
>["query"];
