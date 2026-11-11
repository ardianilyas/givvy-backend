import { relations } from "drizzle-orm";
import { donations, payments } from "../schemas";

export const paymentRelations = relations(payments, ({ one }) => ({
  donation: one(donations, {
    fields: [payments.donationId],
    references: [donations.id],
  }),
}));
