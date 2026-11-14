import { db } from "@/shared/db";
import * as schema from "@/shared/db/schemas";
import { reset } from "drizzle-seed";

export async function clearDb() {
  await reset(db, schema);
}
