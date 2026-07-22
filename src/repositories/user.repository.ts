import { prisma } from "../config/db.ts";
import type { RegisterInput } from "../validation/user.validation.ts";

export const userRepository = {
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  },

  create: async (data: RegisterInput) => {
    return prisma.user.create({ data });
  },
};
