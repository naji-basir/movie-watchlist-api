import express from "express";
import {
  addToWatchlist,
  removeFromWatchlist,
} from "../controllers/watchlist.controller.ts";
import { authenticate } from "../middleware/authenticate.ts";
import { createWatchListItemSchema } from "../validation/watchlist.validation.ts";
import { validate } from "../middleware/validate.ts";

const router = express.Router();
router.use(authenticate);
router.route("/").post(validate(createWatchListItemSchema), addToWatchlist);
router.route("/:id").delete(removeFromWatchlist);

export default router;
