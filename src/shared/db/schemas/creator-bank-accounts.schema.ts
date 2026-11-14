import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { creators } from "./creators.schema";
import { sql } from "drizzle-orm";

export const creatorBankAccounts = pgTable("creator_bank_accounts", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  bankCode: varchar("bank_code", { length: 50 }).notNull(),
  accountNumberEncrypted: text("account_number_encrypted").notNull(),
  accountNumberLast4: varchar("account_number_last4", { length: 4 }).notNull(),
  accountNameEncrypted: text("account_name_encrypted").notNull(),
  isDefault: boolean("is_default").default(true).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created-at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("creator_bank_accounts_creator_id_idx").on(table.creatorId),
  uniqueIndex("creator_bank_accounts_default_idx").on(table.creatorId).where(sql`${table.isDefault} = true`),
]);
