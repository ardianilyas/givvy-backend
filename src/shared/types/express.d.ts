import "express";
import type { roleEnum } from "../db/schemas";

type UserRole = typeof roleEnum.enumValues[number];

export interface SessionUser {
  id: string;
  name?: string;
  email: string;
  emailVerified: boolean;
  role: UserRole,
  image?: string | null | undefined;
}

export interface AuthSession {
  session: {
    id: string;
    expiresAt: Date;
  };

  user: SessionUser;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthSession;
    }
  }
}
