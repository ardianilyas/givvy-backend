import { bigint, boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./users.schema";
import { creators } from "./creators.schema";
import { donationStatusEnum } from "./enums.schema";

export const donations = pgTable("donations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user-id").notNull().references(() => user.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id").notNull().references(() => creators.id),
  amount: bigint("amount", { mode: "number" }).notNull(),
  message: text("message"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  status: donationStatusEnum("status").notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("donations_user_id_idx").on(table.userId),
  index("donations_creator_id_idx").on(table.creatorId),
  index("donations_status_idx").on(table.status),
]);
