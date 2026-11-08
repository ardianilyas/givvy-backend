import { db } from "@/shared/db";
import { user } from "@/shared/db/schemas";
import { addDays } from "date-fns";
import { and, eq, lt } from "drizzle-orm";
import { USER_CLEANUP_CONFIG } from "./user.constant";

export async function deleteUnverifiedUsers(): Promise<number> {
  const cutoffDate = addDays(new Date(), USER_CLEANUP_CONFIG.UNVERIFIED_ACCOUNT_EXPIRY_DAYS);

  const deletedUsers = await db.delete(user).where(and(
    eq(user.emailVerified, false),
    lt(user.createdAt, cutoffDate),
  )).returning({ id: user.id });

  return deletedUsers.length;
}
