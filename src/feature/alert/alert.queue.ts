import { Queue } from "bullmq";
import { CREATOR_QUEUE, CREATOR_JOBS } from "./alert.constants";
import type { AlertPayload } from "./alert.types";
import { redis } from "@/shared/config/redis";
import { logger } from "@/shared/lib/logger";

export const creatorQueue = new Queue(CREATOR_QUEUE, {
  connection: redis,
});

export async function addDonationAlert(
  alertToken: string,
  payload: AlertPayload,
) {
  const job = await creatorQueue.add(
    CREATOR_JOBS.SEND_DONATION_ALERT,
    {
      alertToken,
      payload,
    },
    {
      jobId: `donation-alert-${payload.donationId}`,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  );

  logger.info(
    {
      action: "donation.alert.queued",
      jobId: job.id,
      donationId: payload.donationId,
    },
    "Donation alert added to queue",
  );

  return job;
}
