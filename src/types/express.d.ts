import { User } from "@prisma/client";
declare global {
  namespace Express {
    interface Request {
      user?: User;
      validated?: {
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
