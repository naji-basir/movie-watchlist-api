import express from "express";
import { login, logout, register } from "../controllers/auth.controller.ts";
import { validate } from "../middleware/validate.ts";
import { loginSchema, registerSchema } from "../validation/user.validation.ts";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);

export default router;
