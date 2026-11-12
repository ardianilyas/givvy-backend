import { Worker } from "bullmq";
import { CREATOR_QUEUE, CREATOR_JOBS } from "./alert.constants";
import { redis } from "@/shared/config/redis";
import { sendAlert } from "./alert.service";
import { logger } from "@/shared/lib/logger";

export const alertWorker = new Worker(
  CREATOR_QUEUE,
  async (job) => {
    switch (job.name) {
      case CREATOR_JOBS.SEND_DONATION_ALERT: {
        console.log("Worker received:", job.name, job.id);
        const { alertToken, payload } = job.data;

        await sendAlert(alertToken, payload);

        logger.info(
          {
            action: "donation.alert.sent",
            donationId: payload.donationId,
            jobId: job.id,
          },
          "Donation alert sent successfully",
        );

        break;
      }

      default:
        logger.warn(
          {
            action: "creator.job.unknown",
            jobName: job.name,
            jobId: job.id,
          },
          "Unknown creator job",
        );
    }
  },
  {
    connection: redis,
    concurrency: 5,
  },
);

alertWorker.on("failed", (job, error) => {
  logger.error(
    {
      action: "creator.job.failed",
      jobId: job?.id,
      jobName: job?.name,
      error,
    },
    "Creator job failed",
  );
});
