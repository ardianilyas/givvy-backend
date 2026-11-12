import { scheduleDeleteUnverifiedUsers } from "@/feature/user/user.queue";
import { userWorker } from "@/feature/user/user.worker";
import { redis } from "@/shared/config/redis";
import { creatorWorker } from "./feature/creator/queue/creator.worker";
import { alertWorker } from "./feature/alert/alert.worker";

async function bootstrap() {
  console.log("[Worker] Starting...");

  await userWorker.waitUntilReady();
  await creatorWorker.waitUntilReady();
  await alertWorker.waitUntilReady();

  console.log("[Worker] Worker ready");

  await scheduleDeleteUnverifiedUsers();

  console.log("[Worker] Started successfully");
}

async function shutdown() {
  console.log("[Worker] Shutting down...");

  await Promise.all([
    userWorker.close(),
    creatorWorker.close(),
    alertWorker.close(),
  ]);

  await redis.quit();

  process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

bootstrap().catch(async (error) => {
  console.error("[Worker] Bootstrap failed:", error);

  await Promise.all([
    userWorker.close(),
    creatorWorker.close(),
    alertWorker.close(),
  ]);

  await redis.quit();

  process.exit(1);
});
