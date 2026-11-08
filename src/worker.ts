import { scheduleDeleteUnverifiedUsers } from "@/feature/user/user.queue";
import { userWorker } from "@/feature/user/user.worker";
import { redis } from "@/shared/config/redis";

async function bootstrap() {
  console.log("[Worker] Starting...");

  await userWorker.waitUntilReady();

  console.log("[Worker] Worker ready");

  await scheduleDeleteUnverifiedUsers();

  console.log("[Worker] Started successfully");
}

async function shutdown() {
  console.log("[Worker] Shutting down...");

  await userWorker.close();
  await redis.quit();

  process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

bootstrap().catch(async (error) => {
  console.error("[Worker] Bootstrap failed:", error);

  await userWorker.close();
  await redis.quit();

  process.exit(1);
});
