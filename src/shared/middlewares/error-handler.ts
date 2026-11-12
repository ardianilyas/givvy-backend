import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../errors/app-error";
import { ConflictError } from "../errors/conflict";
import { BadRequestError } from "../errors/bad-request";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const log = req.log;

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
    if (err.statusCode >= 500) {
      log.error(
        {
          action: "reques.failed",
          err,
        },
        "Application error",
      );
    }
    
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

   /**
   * PostgreSQL/Drizzle Database Errors
   */
  if (err.cause && typeof err.cause === "object" && "code" in err.cause) {
    const pgError = err.cause as {
      code: string;
      detail?: string;
    };

    const pgErrors: Record<string, { status: number; message: string }> = {
      "23505": {
        status: 409,
        message: "Record already exists",
      },
      "23503": {
        status: 409,
        message: "Referenced record conflicts with existing data",
      },
      "23502": {
        status: 400,
        message: "Required field is missing",
      },
    };

    const mapped = pgErrors[pgError.code];

    if (mapped) {
      log.warn(
        {
          action: "database.constraint.violation",
          code: pgError.code,
          reqId: req.id,
        },
        "Database constraint violation"
      );

      return res.status(mapped.status).json({
        success: false,
        message: mapped.message,
      });
    }
  }

  log.error(
    {
      err,
      action: "request.internal_error",
      reqId: req.id,
    },
    "Unhandled application error"
  );

  /**
   * Unknown Error
   */
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
