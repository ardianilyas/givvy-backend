import { Queue } from "bullmq";
import { CREATOR_QUEUE_NAME } from "../creator.constant";
import { redis } from "@/shared/config/redis";
import type { CreatorJobData } from "../creator.type";

export const creatorQueue = new Queue<CreatorJobData>(
  CREATOR_QUEUE_NAME,
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: {
        age: 24 * 60 * 60,
        count: 1000,
      },
      removeOnFail: false,
    },
});
