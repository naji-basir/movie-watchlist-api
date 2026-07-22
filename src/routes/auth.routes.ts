import express from "express";
import { login, logout, register } from "../controllers/auth.controller.ts";
import { validate } from "../middlewares/validate.ts";
import { loginSchema, registerSchema } from "../validations/user.validation.ts";
import { authLimiter } from "../middlewares/rateLimiter.ts";

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);

export default router;
