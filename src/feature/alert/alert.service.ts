import { getIO } from "@/shared/socket/socket";
import type { AlertPayload } from "./alert.types";

export function sendAlert(alertToken: string, payload: AlertPayload) {
  const room = `alert:${alertToken}`;

  getIO().of("/api/alert").to(room).emit("alert", payload);
}
