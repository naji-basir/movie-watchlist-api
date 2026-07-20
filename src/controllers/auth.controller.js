import bcrypt from "bcryptjs";
import { prisma } from "../config/db";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  //check if the user already exist
  const userExist = await prisma.user.findUnique({ where: { email } });
  console.log(userExist);

  if (userExist)
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

  res.status(201).json({
    status: "success",
    data: { user: { id: newUser.id, name, email } },
  });
};
