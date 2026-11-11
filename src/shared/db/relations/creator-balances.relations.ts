import { relations } from "drizzle-orm";
import { creatorBalances, creators } from "../schemas";

export const creatorBalancesRelations = relations(
  creatorBalances,
  ({ one }) => ({
    creator: one(creators, {
      fields: [creatorBalances.creatorId],
      references: [creators.id],
    }),
  }),
);
