import { relations } from "drizzle-orm";
import { creatorBankAccounts, creators, withdrawals } from "../schemas";

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  creator: one(creators, {
    fields: [withdrawals.creatorId],
    references: [creators.id],
  }),
  bankAccount: one(creatorBankAccounts, {
    fields: [withdrawals.bankAccountId],
    references: [creatorBankAccounts.id],
  }),
}));
