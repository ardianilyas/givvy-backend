import { bigint, index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { creators } from "./creators.schema";
import { creatorBankAccounts } from "./creator-bank-accounts.schema";
import { withdrawalStatusEnum } from "./enums.schema";

export const withdrawals = pgTable("withdrawals", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "restrict" }),
  bankAccountId: uuid("bank_account_id").references(() => creatorBankAccounts.id, { onDelete: "set null" }),
  bankCode: varchar("bank_code", { length: 50 }).notNull(),
  accountNumberEncrypted: text("account_number_encrypted").notNull(),
  accountNumberLast4: varchar("account_number_last4", { length: 4 }).notNull(),
  accountNameEncrypted: text("account_name_encrypted").notNull(),
  amount: bigint("amount", { mode: "number" }).notNull(),
  platformFee: bigint("platform_fee", { mode: "number" }).notNull(),
  gatewayFee: bigint("gateway_fee", { mode: "number" }).notNull(),
  totalDeducted: bigint("total_deducted", { mode: "number" }).notNull(),
  status: withdrawalStatusEnum("status").default("pending").notNull(),
  referenceId: varchar("reference_id", { length: 100 }).notNull(),
  gatewayReference: varchar("gateway_reference", { length: 150 }),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  uniqueIndex("withdrawals_reference_id_idx").on(table.referenceId),
  index("withdrawals_creator_id_idx").on(table.creatorId),
  index("withdrawals_status_idx").on(table.status),
  index("withdrawals_created_at_idx").on(table.createdAt),
]);
