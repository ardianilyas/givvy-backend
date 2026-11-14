import { Worker } from "bullmq";
import { CREATOR_JOBS, CREATOR_QUEUE_NAME } from "../creator.constant";
import { CreatorService } from "../services/creator.service";
import type { CreatorJobData } from "../creator.type";
import { redis } from "@/shared/config/redis";
import { logger } from "@/shared/lib/logger";

const creatorService = new CreatorService();

export const creatorWorker = new Worker<CreatorJobData>(
  CREATOR_QUEUE_NAME,
  async(job) => {
    switch (job.name) {
      case CREATOR_JOBS.SEND_WELCOME_CREATOR_EMAIL: {
        const { to, subject, username } = job.data;
        const id = await creatorService.sendWelcomeEmailToCreator(to, subject, username);
        logger.info(
          {
            action: "welcome-creator-email.sent",
            id,
            data: job.data
          },
          "Welcome creator email sent successfully"
        )
        break;
      }
      default: {
        throw new Error(`Unknown creator job: ${job.name}`);
      }
    }
  },
  {
    connection: redis,
    concurrency: 5
  }
);

creatorWorker.on("completed", (job) => {
  console.log(`[Creator Worker] Job ${job.id} completed`);
});

creatorWorker.on("failed", (job, error) => {
  console.error(`[Creator Worker Job ${job?.id} failed:`, error.message);
});

creatorWorker.on("error", (error) => {
  console.log(`[Creator Worker Error]: `, error);
});
