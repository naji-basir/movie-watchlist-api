import { z } from "zod";

const statusEnum = z.enum(["PLANNED", "WATCHING", "COMPLETED", "DROPPED"]);

const addToWatchlistBody = z
  .strictObject({
    movieId: z.uuid().meta({ description: "ID of the movie to add" }),
    status: statusEnum.default("PLANNED").meta({ description: "Watch status" }),
    rating: z.coerce
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .meta({ description: "Rating 1-10", examples: [8] }),
    notes: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .meta({ description: "Personal notes" }),
  })
  .meta({ id: "AddToWatchlistInput" });

export const addToWatchlistSchema = z.object({ body: addToWatchlistBody });

// Base shape used for OpenAPI docs (no refine — keeps shape introspectable)
const updateWatchlistItemBodyBase = z
  .strictObject({
    status: statusEnum,
    rating: z.coerce.number().int().min(1).max(10).nullable(),
    notes: z.string().trim().max(1000).nullable(),
  })
  .partial()
  .meta({ id: "UpdateWatchlistItemInput" });

// Validation version — adds the refine, used by your middleware
const updateWatchlistItemBody = updateWatchlistItemBodyBase.refine(
  (data) => Object.keys(data).length > 0,
  { error: "At least one field must be provided." },
);

const watchlistItemIdParams = z
  .strictObject({ id: z.uuid().meta({ description: "Watchlist item ID" }) })
  .meta({ id: "WatchlistItemIdParam" });

export const updateWatchlistItemSchema = z.object({
  params: watchlistItemIdParams,
  body: updateWatchlistItemBody,
});

export const watchlistItemIdParamSchema = z.object({
  params: watchlistItemIdParams,
});

const getWatchlistQuery = z
  .strictObject({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(["createdAt", "updatedAt", "rating"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
    status: statusEnum.optional(),
  })
  .meta({ id: "GetWatchlistQuery" });

export const getWatchlistQuerySchema = z.object({ query: getWatchlistQuery });

export type AddToWatchlistInput = z.infer<typeof addToWatchlistSchema>["body"];
export type UpdateWatchlistItemInput = z.infer<
  typeof updateWatchlistItemSchema
>["body"];
export type GetWatchlistQuery = z.infer<
  typeof getWatchlistQuerySchema
>["query"];

// exported for openapi.ts
export {
  addToWatchlistBody,
  updateWatchlistItemBodyBase,
  watchlistItemIdParams,
  getWatchlistQuery,
};
