import { z } from "zod";

export const watchListStatusSchema = z.enum([
  "PLANNED",
  "WATCHING",
  "COMPLETED",
  "DROPPED",
]);

export const createWatchListItemSchema = z.object({
  body: z.strictObject({
    movieId: z.uuid(),
    status: watchListStatusSchema.default("PLANNED"),
    rating: z.int().min(1).max(10).optional(),
    notes: z.string().trim().max(1000).optional(),
  }),
});

export const updateWatchListItemSchema = z.object({
  body: createWatchListItemSchema.shape.body.partial(),
});

export type CreateWatchListItemInput = z.infer<
  typeof createWatchListItemSchema
>["body"];

export type UpdateWatchListItemInput = z.infer<
  typeof updateWatchListItemSchema
>["body"];
