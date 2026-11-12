import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./users.schema";

export const creators = pgTable("creators", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  username: varchar("username", { length: 50 }).unique().notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  avatarUrl: varchar("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  alertToken: varchar("alert_token", { length: 64 }).notNull().unique(),
  
  isVerified: boolean("is_verified").default(false),
  verifiedUntil: timestamp("verified_until"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});
