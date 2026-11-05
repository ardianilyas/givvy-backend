import { afterAll } from "vitest";
import { clearDb } from "./helpers/clear-db";

afterAll(async () => {
  await clearDb();
});
