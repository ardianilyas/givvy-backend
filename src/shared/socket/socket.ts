import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { createAdapter } from "@socket.io/redis-adapter";
import { redis } from "../config/redis";
import { env } from "../config/env";

let io: Server | null = null;

export async function initializeSocket(server: HttpServer) {
  const pubClient = redis.duplicate();
  const subClient = redis.duplicate();

  await Promise.all([
    new Promise<void>((resolve, reject) => {
      if (pubClient.status === "ready") return resolve();
      pubClient.once("ready", resolve);
      pubClient.once("error", reject);
    }),
    new Promise<void>((resolve, reject) => {
      if (subClient.status === "ready") return resolve();
      subClient.once("ready", resolve);
      subClient.once("error", reject);
    }),
  ]);

  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.adapter(createAdapter(pubClient, subClient));

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }

  return io;
}
