import express from "express";
import { getAll } from "../controllers/movie.controller";
import { authMiddleware } from "../middleware/auth.middleware";
const router = express.Router();
router.use(authMiddleware);
router.route("/").get(getAll);
export default router;
