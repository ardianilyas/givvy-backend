import { redis } from "@/shared/config/redis";
import { QUEUE_NAMES } from "@/shared/queue/queue.constant";
import { Queue } from "bullmq";
import { USER_CLEANUP_CONFIG, USER_JOB, USER_JOB_CONFIG, USER_SCHEDULER } from "./user.constant";

export const userQueue = new Queue(QUEUE_NAMES.USER_MAINTENANCE, {
  connection: redis,
  defaultJobOptions: {
    attempts: USER_JOB_CONFIG.ATTEMPTS,
    backoff: {
      type: "exponential",
      delay: USER_JOB_CONFIG.BACKOFF_DELAY,
    },
    removeOnComplete: USER_JOB_CONFIG.REMOVE_ON_COMPLETE,
    removeOnFail: USER_JOB_CONFIG.REMOVE_ON_FAIL,
  },
});

export async function scheduleDeleteUnverifiedUsers() {
  await userQueue.upsertJobScheduler(
    USER_SCHEDULER.DELETE_UNVERIFIED_DAILY,
    {
      pattern: USER_CLEANUP_CONFIG.SCHEDULE_CRON,
      tz: USER_CLEANUP_CONFIG.TIMEZONE,
    },
    {
      name: USER_JOB.DELETE_UNVERIFIED,
      data: {},
    },
  );

  console.log("[Queue] Scheduler registered");

  const scheduler = await userQueue.getJobScheduler(
    "delete-unverified-users-daily",
  );

  console.log("[Queue] Scheduler:", scheduler);
}
