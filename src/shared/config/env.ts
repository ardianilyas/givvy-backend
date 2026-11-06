import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string({
    error: "Node_ENV is required",
  }),

  PORT: z.string({
    error: "PORT is required",
  }),

  DATABASE_URL: z.string({
    error: "DATABASE_URL is required",
  }),

  BETTER_AUTH_SECRET: z.string({
    error: "BETTER_AUTH_SECRET is required",
  }),

  BETTER_AUTH_URL: z.string({
    error: "BETTER_AUTH_URL is required",
  }),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables:",
    z.prettifyError(parsedEnv.error)
  );

  process.exit(1);
}

export const env = parsedEnv.data;
