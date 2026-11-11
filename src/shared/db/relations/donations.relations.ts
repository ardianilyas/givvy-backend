import { relations } from "drizzle-orm";
import { creators, donations, payments, user } from "../schemas";

export const donationRelations = relations(donations, ({ one }) => ({
  user: one(user, {
    fields: [donations.userId],
    references: [user.id],
  }),
  creator: one(creators, {
    fields: [donations.creatorId],
    references: [creators.id],
  }),
  payment: one(payments)
}));
