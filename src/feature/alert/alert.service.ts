import { Emitter } from "@socket.io/redis-emitter";
import { redis } from "@/shared/config/redis";
import type { AlertPayload } from "./alert.types";
import { logger } from "@/shared/lib/logger";

const emitter = new Emitter(redis.duplicate());

export function sendAlert(alertToken: string, payload: AlertPayload) {
  const room = `alert:${alertToken}`;

  logger.info(
    {
      action: "donation.alert.emitting",
      room,
      namespace: "/api/alert",
    },
    "Emitting donation alert",
  );

  emitter.of("/api/alert").to(room).emit("alert", payload);
}
