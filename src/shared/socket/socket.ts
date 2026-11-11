import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { env } from "../config/env";

let io: Server | null = null;

export function initializeSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true
    },
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }

  return io;
}
