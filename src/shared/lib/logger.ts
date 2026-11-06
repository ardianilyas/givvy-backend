import pino from "pino";
import path from "node:path";
import { env } from "../config/env";

const logDirectory = path.resolve(process.cwd(), "logs");

const appStream = pino.transport({
  target: "pino-roll",
  options: {
    file: path.join(logDirectory, "app"),
    frequency: "daily",
    dateFormat: "yyyy-MM-dd",
    mkdir: true,
    limit: {
      count: 14,
    },
  },
});

const errorStream = pino.transport({
  target: "pino-roll",
  options: {
    file: path.join(logDirectory, "error"),
    frequency: "daily",
    dateFormat: "yyyy-MM-dd",
    mkdir: true,
    limit: {
      count: 30,
    },
  },
});

export const logger = pino(
  {
    level:
      env.NODE_ENV === "production"
      ? "info"
      : "debug",

    timestamp: pino.stdTimeFunctions.isoTime,

    base: {
      service: "givvy",
    },

    redact: {
      paths: [
        "password",
        "token",
        "authorization",
        "cookie",
        "req.headers.authorization",
        "req.headers.cookie",
      ],
      censor: "[REDACTED]",
    },
  },

  pino.multistream(
    [
      {
        level: "debug",
        stream: appStream,
      },
      {
        level: "error",
        stream: errorStream,
      },
    ],
    {
      dedupe: true,
    },
  ),
);
