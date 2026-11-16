import { db } from "@/shared/db";
import { creatorBalances } from "@/shared/db/schemas";
import { ForbiddenError } from "@/shared/errors/forbidden";
import { NotFoundError } from "@/shared/errors/not-found";
import { isProduction } from "better-auth";
import { eq, sql } from "drizzle-orm";

export async function injectBalanceToCreator(creatorId: string, amount: number) {
  if (isProduction) throw new ForbiddenError("This operation can't be run on prod");

  const [addedBalance] = await db
    .update(creatorBalances)
    .set({
      balance: sql`${creatorBalances.balance} + ${amount}`,
    })
    .where(
      eq(creatorBalances.creatorId, creatorId),
    )
    .returning();

  if (!addedBalance) throw new NotFoundError("Creator balance not found");

  return addedBalance;
}
