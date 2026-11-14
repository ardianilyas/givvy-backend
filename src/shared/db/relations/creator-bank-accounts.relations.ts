import { relations } from "drizzle-orm";
import { creatorBankAccounts, creators, withdrawals } from "../schemas";

export const creatorBankAccountsRelations = relations(creatorBankAccounts, ({ one, many }) => ({
  creator: one(creators, {
    fields: [creatorBankAccounts.creatorId],
    references: [creators.id],
  }),
  withdrawals: many(withdrawals),
}));
