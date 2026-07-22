import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.ts";
import { validate } from "../middlewares/validate.js";

import {
  addToWatchlistSchema,
  updateWatchlistItemSchema,
  watchlistItemIdParamSchema,
  getWatchlistQuerySchema,
} from "../validations/watchlist.validation.ts";

import {
  addToWatchlist,
  getWatchlistItem,
  getMyWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
} from "../controllers/watchlist.controller.js";

const router = Router();

// Every watchlist route requires authentication — there is no public watchlist data.
router.use(authenticate);

router.get("/", validate(getWatchlistQuerySchema), getMyWatchlist);
router.get("/:id", validate(watchlistItemIdParamSchema), getWatchlistItem);
router.post("/", validate(addToWatchlistSchema), addToWatchlist);
router.patch("/:id", validate(updateWatchlistItemSchema), updateWatchlistItem);

router.delete(
  "/:id",
  validate(watchlistItemIdParamSchema),
  removeFromWatchlist,
);

export default router;
