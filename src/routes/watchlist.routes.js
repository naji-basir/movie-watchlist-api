import express from "express";
import { addToWatchlist } from "../controllers/watchlist.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();
router.use(authMiddleware);
router.post("/", addToWatchlist);

export default router;
