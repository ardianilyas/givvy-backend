import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("[Redis] Connected");
});

redis.on("error", (error) => {
  console.error("[Redis] Error:", error);
});
