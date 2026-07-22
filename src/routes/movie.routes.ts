import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.ts";
import { authorize } from "../middlewares/authorize.ts";
import { validate } from "../middlewares/validate.ts";

import {
  createMovieSchema,
  updateMovieSchema,
  movieIdParamSchema,
  getMoviesQuerySchema,
} from "../validations/movie.validation.ts";

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
