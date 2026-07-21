import express from "express";
import { getAll } from "../controllers/movie.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";
const router = express.Router();
router.use(authMiddleware);
router.route("/").get(getAll);
export default router;
