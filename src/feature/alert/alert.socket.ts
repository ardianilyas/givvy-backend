import { Server } from "socket.io";
import { auth } from "@/shared/lib/auth";
import { db } from "@/shared/db";
import { eq } from "drizzle-orm";
import { fromNodeHeaders } from "better-auth/node";
import { creators } from "@/shared/db/schemas";
import { UnauthorizedError } from "@/shared/errors/unauthorized";

export function initializeAlertSocket(io: Server) {
  const alertNamespace = io.of("/api/alert");

  alertNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Alert token is required"));
      }

      const session = await auth.api.getSession({
        headers: fromNodeHeaders(socket.handshake.headers),
      });

      if (!session) {
        return next(new UnauthorizedError());
      }

      const creator = await db.query.creators.findFirst({
        where: eq(creators.alertToken, token),
        columns: {
          id: true,
          userId: true,
        },
      });

      if (!creator || creator.userId !== session.user.id) {
        return next(new Error("Invalid alert token"));
      }

      socket.data.creatorId = creator.id;
      socket.data.alertToken = token;

      next();
    } catch (error) {
      next(new UnauthorizedError("Authentication failed"));
    }
  });

  alertNamespace.on("connection", (socket) => {
    const room = `alert:${socket.data.alertToken}`;

    socket.join(room);

    console.log(`Creator connected: ${socket.data.creatorId}`);

    socket.on("disconnect", () => {
      console.log(`Creator disconnected: ${socket.data.creatorId}`);
    });
  });
}
