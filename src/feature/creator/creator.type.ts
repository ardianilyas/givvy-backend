import type { creators } from "@/shared/db/schemas";

export type Creator = typeof creators.$inferSelect;
