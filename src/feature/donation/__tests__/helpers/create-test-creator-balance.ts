import { db } from "@/shared/db";
import { creatorBalances } from "@/shared/db/schemas";

export async function createTestCreatorBalance(creatorId: string) {
  const [creatorBalance] = await db.insert(creatorBalances).values({ creatorId }).returning();

  if (!creatorBalance) throw new Error("Failed to create creator balance");

  return creatorBalance;
}
