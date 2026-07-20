import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { generateToken } from "../utils/jwt";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";

// helper
const setCookie = async (res, token) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
};

export const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  //check if the user already exist
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    throw new AppError("User already exists with this email.", 400);
  }
  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // create the user
  const newUser = await prisma.user.create({
    data: { name, email, password: hash },
  });

  //generate token
  const token = generateToken(newUser.id);
  setCookie(res, token);

  return res.status(201).json({
    status: "success",
    data: { user: { id: newUser.id, name, email } },
    token,
  });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  //varify password
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = generateToken(user.id);
  setCookie(res, token);

  return res.status(200).json({
    status: "success",
    message: "Login successful",
    data: { user: { id: user.id, email } },
    token,
  });
});

export const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });

  res.status(200).json({ status: "success", message: "Logout successfuly." });
};
