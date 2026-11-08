import { Worker } from "bullmq";
import { redis } from "@/shared/config/redis";
import { deleteUnverifiedUsers } from "./user.service";
import { QUEUE_NAMES } from "@/shared/queue/queue.constant";
import { USER_JOB, USER_JOB_CONFIG } from "./user.constant";

export const userWorker = new Worker(
  QUEUE_NAMES.USER_MAINTENANCE,
  async (job) => {
    console.log("[Worker] Processing:", job.name);
    console.log("[Worker] Data:", job.data);

    switch (job.name) {
      case USER_JOB.DELETE_UNVERIFIED: {
        const deletedCount = await deleteUnverifiedUsers();

        console.log(`[Worker] Deleted ${deletedCount} users`);

        return { deletedCount };
      }

      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  },
  {
    connection: redis,
    concurrency: USER_JOB_CONFIG.CONCURRENCY,
  },
);

userWorker.on("ready", () => {
  console.log("[Worker] Ready");
});

userWorker.on("active", (job) => {
  console.log("[Worker] Active:", job.name);
});

userWorker.on("completed", (job, result) => {
  console.log("[Worker] Completed:", job.name, result);
});

userWorker.on("failed", (job, error) => {
  console.error("[Worker] Failed:", job?.name, error);
});

userWorker.on("error", (error) => {
  console.error("[Worker] Error:", error);
});
