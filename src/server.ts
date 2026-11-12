import app from "./app";
import { env } from "./shared/config/env";
import { createServer } from "node:http";
import { initializeSocket } from "./shared/socket/socket";
import { initializeAlertSocket } from "./feature/alert/alert.socket";

const PORT = env.PORT;

const server = createServer(app);

const io = await initializeSocket(server);

initializeAlertSocket(io);

server.on("error", (error) => {
  console.error("HTTP Server Error:", error);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
