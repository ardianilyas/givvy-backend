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

  REDIS_HOST: z.string({ error: "Redis host is required" }).default("127.0.0.1"),

  REDIS_PORT: z.coerce.number().default(6379),

  REDIS_USERNAME: z.string().optional(),

  REDIS_PASSWORD: z.string().optional(),

  RESEND_API_KEY: z.string({ error: "RESEND_API_KEY is required" }),

  EMAIL_FROM: z.string({ error: "EMAIL_FROM is required" })
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
