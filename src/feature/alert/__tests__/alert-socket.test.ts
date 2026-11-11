
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";

import { createServer } from "node:http";
import { io as createClient, type Socket } from "socket.io-client";
import type { Server as SocketServer } from "socket.io";

import { initializeSocket } from "@/shared/socket/socket";
import { initializeAlertSocket } from "../alert.socket";
import { sendAlert } from "../alert.service";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  findFirst: vi.fn(),
}));

vi.mock("@/shared/lib/auth", () => ({
  auth: {
    api: {
      getSession: mocks.getSession,
    },
  },
}));

vi.mock("@/shared/db", () => ({
  db: {
    query: {
      creators: {
        findFirst: mocks.findFirst,
      },
    },
  },
}));

describe("Alert Socket", () => {
  let server: ReturnType<typeof createServer>;
  let io: SocketServer;
  let clientA: Socket;
  let clientB: Socket;

  beforeEach(() => {
    mocks.getSession.mockResolvedValue({
      user: { id: "user-1" },
    });

    mocks.findFirst.mockImplementation(async ({ where }: any) => {
      // Mock creator berdasarkan token yang dicari
      // Sesuaikan jika implementasi query Drizzle berbeda.
      return {
        id: "creator-1",
        userId: "user-1",
      };
    });
  });

  afterEach(async () => {
    clientA?.disconnect();
    clientB?.disconnect();

    if (io) {
      await new Promise<void>((resolve) => {
        io.close(() => resolve());
      });
    }

    vi.clearAllMocks();
  });

  async function startServer() {
    server = createServer();

    io = initializeSocket(server);
    initializeAlertSocket(io);

    await new Promise<void>((resolve) => {
      server.listen(0, resolve);
    });

    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Server address unavailable");
    }

    return `http://localhost:${address.port}/api/alert`;
  }

  function connectClient(url: string, token: string) {
    return createClient(url, {
      auth: { token },
      transports: ["websocket"],
      reconnection: false,
    });
  }

  function waitForConnect(socket: Socket) {
    return new Promise<void>((resolve, reject) => {
      socket.once("connect", resolve);
      socket.once("connect_error", reject);
    });
  }

  function waitForConnectError(socket: Socket) {
    return new Promise<Error>((resolve) => {
      socket.once("connect_error", resolve);
    });
  }

  it("should connect and receive alert", async () => {
    const url = await startServer();

    clientA = connectClient(url, "token-a");

    await waitForConnect(clientA);

    const alertPromise = new Promise<any>((resolve) => {
      clientA.once("alert", resolve);
    });

    sendAlert("token-a", {
      type: "text",
      data: {
        username: "John",
        message: "Hello!",
        amount: 50000,
      },
    });

    const payload = await alertPromise;

    expect(payload.type).toBe("text");
    expect(payload.data.message).toBe("Hello!");
    expect(payload.data.amount).toBe(50000);
  });

  it("should reject invalid alert token", async () => {
    mocks.findFirst.mockResolvedValueOnce(null);

    const url = await startServer();

    clientA = connectClient(url, "invalid-token");

    const errorPromise = waitForConnectError(clientA);

    const error = await errorPromise;

    expect(error.message).toBe("Invalid alert token");
    expect(clientA.connected).toBe(false);
  });

  it("should reject unauthenticated session", async () => {
    mocks.getSession.mockResolvedValueOnce(null);

    const url = await startServer();

    clientA = connectClient(url, "token-a");

    const errorPromise = waitForConnectError(clientA);

    const error = await errorPromise;

    expect(error.message).toBe("Unauthorized");
    expect(clientA.connected).toBe(false);
  });

  it("should isolate alerts between creator rooms", async () => {
    const url = await startServer();

    // Creator A
    clientA = connectClient(url, "token-a");

    // Creator B
    clientB = connectClient(url, "token-b");

    // Wait until both clients connect
    await Promise.all([
      waitForConnect(clientA),
      waitForConnect(clientB),
    ]);

    // Prepare listener for creator A
    const receivedByA = vi.fn();

    clientA.on("alert", receivedByA);

    const receivedByB = new Promise<any>((resolve) => {
      clientB.once("alert", resolve);
    });

    // Send alert only to creator B
    sendAlert("token-b", {
      type: "text",
      data: {
        username: "Jane",
        message: "Private message",
        amount: 100000,
      },
    });

    const payload = await receivedByB;

    expect(payload.data.message).toBe("Private message");

    // Creator A should not receive creator B's alert
    expect(receivedByA).not.toHaveBeenCalled();
  });
});
