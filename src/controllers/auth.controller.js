import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { generateToken } from "../utils/jwt";

// helper
const setCookie = async (res, token) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  //check if the user already exist
  const user = await prisma.user.findUnique({ where: { email } });

  if (user)
    return res
      .status(400)
      .json({ error: "User already exist with this email." });

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
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  //varify password
  const isValidPassowd = await bcrypt.compare(password, user.password);

  if (!isValidPassowd) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = generateToken(user.id);
  setCookie(res, token);

  return res.status(200).json({
    message: "Login successful",
    data: { user: { id: user.id, email } },
    token,
  });
};
