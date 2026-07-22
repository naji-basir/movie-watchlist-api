import { Router } from "express";
import { authenticate } from "../middleware/authenticate.ts";
import { authorize } from "../middleware/authorize.ts";
import { validate } from "../middleware/validate.ts";

import {
  createMovieSchema,
  updateMovieSchema,
  movieIdParamSchema,
  getMoviesQuerySchema,
} from "../validation/movie.validation.ts";

import {
  createMovie,
  getMovie,
  getAllMovies,
  updateMovie,
  deleteMovie,
} from "../controllers/movie.controller.ts";

const router = Router();

router.get("/", authenticate, validate(getMoviesQuerySchema), getAllMovies);
router.get("/:id", validate(movieIdParamSchema), getMovie);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createMovieSchema),
  createMovie,
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateMovieSchema),
  updateMovie,
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(movieIdParamSchema),
  deleteMovie,
);

export default router;
