import { bigint, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { donations } from "./donations.schema";
import { paymentStatusEnum } from "./enums.schema";

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  donationId: uuid("donation_id").notNull().references(() => donations.id),
  provider: varchar("provider", { length: 50 }).notNull().default("borderpay"),
  referenceId: varchar("reference_id", { length: 255 }).notNull(),
  paymentUrl: text("payment_url"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  amount: bigint("amount", { mode: "number" }).notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  expiredAt: timestamp("expired_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("payments_donation_id_idx").on(table.donationId),
  uniqueIndex("payments_reference_id_idx").on(table.referenceId),
]);
