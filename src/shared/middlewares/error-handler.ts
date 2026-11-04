import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../errors/app-error";
import { NotFoundError } from "../errors/not-found";
import { ConflictError } from "../errors/conflict";
import { BadRequestError } from "../errors/bad-request";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  /**
   * Zod Validation Error
   */
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  /**
   * Custom App Error
   */
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

   /**
   * PostgreSQL/Drizzle Database Errors
   */
  if (err instanceof Error && err.cause && typeof err.cause === "object" && "code" in err.cause) {
    const pgError = err.cause as { code: string; detail?: string };

    // 23505: unique violation
    if (pgError.code === "23505") {
      const message = pgError.detail ?? "Record already exist";
      throw new ConflictError(message);
    }

    // 23503: foreign key violation
    if (pgError.code === "23503") {
      const message = pgError.detail ?? "Referenced record does not exist";
      throw new NotFoundError(message);
    }

    // 23502: not null violation
    if (pgError.code === "23502") {
      const message = pgError.detail ?? "Required field is missing";
      throw new BadRequestError(message);    
    }
  }

  /**
   * Unknown Error
   */
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};