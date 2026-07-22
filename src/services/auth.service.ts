import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.ts";
import AppError from "../utils/AppError.ts";
import { userRepository } from "../repositories/user.repository.ts";

export const authService = {
  register: async (name: string, email: string, password: string) => {
    // 1. Check if user exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError("User already exists with this email.", 400);
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    // 4. Generate token
    const token = generateToken(newUser.id);

    // 5. Return sanitized user data and token
    return {
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      token,
    };
  },

  login: async (email: string, password: string) => {
    // 1. Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("Invalid email or password.", 401);
    }

    // 2. Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError("Invalid email or password.", 401);
    }

    // 3. Generate token
    const token = generateToken(user.id);

    // 4. Return sanitized user data and token
    return {
      user: { id: user.id, email: user.email },
      token,
    };
  },
};
