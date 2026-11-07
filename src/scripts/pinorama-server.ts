import Fastify from "fastify";
import cors from "@fastify/cors";
import pinoramaServer from "pinorama-server";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const logDirectory = path.resolve(process.cwd(), "logs");

const databasePath = path.join(
  logDirectory,
  "pinorama.msp",
);

async function main() {
  await mkdir(logDirectory, { recursive: true });

  const app = Fastify({
    logger: false,
  });

  await app.register(cors, {
    origin: true, // untuk development saja
  });

  await app.register(pinoramaServer, {
    prefix: "/pinorama",
    dbPath: databasePath,
    autoSaveInterval: 60_000,
  });

  await app.listen({
    port: 6201,
    host: "127.0.0.1",
  });

  console.log("[Pinorama] Server running on port 6201");
  console.log(`[Pinorama] Database: ${databasePath}`);

  const shutdown = async () => {
    console.log("[Pinorama] Saving database and shutting down...");

    try {
      await app.close();
      console.log("[Pinorama] Database saved successfully");
      process.exit(0);
    } catch (error) {
      console.error("[Pinorama] Shutdown failed:", error);
      process.exit(1);
    }
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error("[Pinorama] Server startup failed:", error);
  process.exit(1);
});
