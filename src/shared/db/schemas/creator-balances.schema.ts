import { bigint, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { creators } from "./creators.schema";

export const creatorBalances = pgTable("creator_balances", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: uuid("creator_id").notNull().unique().references(() => creators.id),
  balance: bigint("balance", { mode: "number" }).notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
