import { relations } from "drizzle-orm";
import { creatorBalances, creatorBankAccounts, creators, donations, user, withdrawals } from "../schemas";

export const creatorRelations = relations(creators, ({ one, many }) => ({
  user: one(user, {
    fields: [creators.userId],
    references: [user.id]
  }),
  donations: many(donations),
  balance: one(creatorBalances),
  bankAccounts: many(creatorBankAccounts),
  withdrawals: many(withdrawals),
}));
