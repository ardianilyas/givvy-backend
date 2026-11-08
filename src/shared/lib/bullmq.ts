import type { RedisOptions } from "ioredis";
import { redisConfig } from "../config/redis";

export const bullMQConfig: RedisOptions = {
  ...redisConfig
};
