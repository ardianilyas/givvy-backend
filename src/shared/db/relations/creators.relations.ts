import { relations } from "drizzle-orm";
import { creators, user } from "../schemas";

export const creatorRelations = relations(creators, ({ one }) => ({
  user: one(user, {
    fields: [creators.userId],
    references: [user.id]
  }),
}));
