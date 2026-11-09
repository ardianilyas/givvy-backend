import type { creators } from "@/shared/db/schemas";
import type { CREATOR_JOBS } from "./creator.constant";

export type Creator = typeof creators.$inferSelect;

export interface SendWelcomeCreatorEmailJob {
  to: string;
  subject: string;
}

export type CreatorJobData =
  | {
    type: typeof CREATOR_JOBS.SEND_WELCOME_CREATOR_EMAIL;
    to: string;
    subject: string;
    username: string;
  },
