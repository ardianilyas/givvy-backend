import { defineConfig } from "drizzle-kit";
import { env } from "./src/shared/config/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/shared/db/schemas/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL
  }
});
