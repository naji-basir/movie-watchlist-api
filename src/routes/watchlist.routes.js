import express from "express";
import {
  addToWatchlist,
  removeFromWatchlist,
} from "../controllers/watchlist.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();
router.use(authMiddleware);
router.route("/").post(addToWatchlist);
router.route("/:id").delete(removeFromWatchlist);

export default router;
