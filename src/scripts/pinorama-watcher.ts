import { watch } from "chokidar";
import { createReadStream } from "node:fs";
import { once } from "node:events";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const logDirectory = path.resolve(process.cwd(), "logs");
const checkpointPath = path.join(logDirectory, ".pinorama-checkpoint.json");

const appLogPattern = /^app\..+\.log$/;

type FileCheckpoint = {
  offset: number;
  pending: string;
  dev: number;
  ino: number;
};

type CheckpointData = {
  version: 1;
  files: Record<string, FileCheckpoint>;
};

const checkpoints = new Map<string, FileCheckpoint>();
const jobs = new Map<string, Promise<void>>();

let persistQueue: Promise<void> = Promise.resolve();

async function loadCheckpoint() {
  try {
    const content = await readFile(checkpointPath, "utf8");
    const data = JSON.parse(content) as CheckpointData;

    if (data.version !== 1 || !data.files) {
      throw new Error("Unsupported checkpoint format");
    }

    for (const [filePath, checkpoint] of Object.entries(data.files)) {
      checkpoints.set(filePath, checkpoint);
    }

    console.error("[Pinorama] Checkpoint loaded");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.error("[Pinorama] No checkpoint found. Reading logs from start.");
      return;
    }

    throw error;
  }
}

function saveCheckpoint() {
  const snapshot: CheckpointData = {
    version: 1,
    files: Object.fromEntries(checkpoints),
  };

  const content = JSON.stringify(snapshot, null, 2);
  const temporaryPath = `${checkpointPath}.tmp`;

  persistQueue = persistQueue
    .catch(() => undefined)
    .then(async () => {
      await writeFile(temporaryPath, content, "utf8");
      await rename(temporaryPath, checkpointPath);
    });

  return persistQueue;
}

async function forwardLine(line: string) {
  try {
    const record = JSON.parse(line);

    // Support older logs that use ISO timestamp strings.
    if (typeof record.time === "string") {
      const timestamp = Date.parse(record.time);

      if (Number.isNaN(timestamp)) {
        throw new Error("Invalid log timestamp");
      }

      record.time = timestamp;
    }

    const output = `${JSON.stringify(record)}\n`;

    // Respect stdout backpressure.
    if (!process.stdout.write(output)) {
      await once(process.stdout, "drain");
    }
  } catch (error) {
    console.error("[Pinorama] Failed to forward log:", error);
  }
}

async function readNewContent(filePath: string) {
  const fileStat = await stat(filePath).catch(() => null);

  if (!fileStat?.isFile()) return;

  let checkpoint = checkpoints.get(filePath) ?? {
    offset: 0,
    pending: "",
    dev: fileStat.dev,
    ino: fileStat.ino,
  };

  // Detect file replacement or truncation.
  if (
    checkpoint.dev !== fileStat.dev ||
    checkpoint.ino !== fileStat.ino ||
    fileStat.size < checkpoint.offset
  ) {
    checkpoint = {
      offset: 0,
      pending: "",
      dev: fileStat.dev,
      ino: fileStat.ino,
    };
  }

  if (fileStat.size <= checkpoint.offset) return;

  const chunks: Buffer[] = [];

  const stream = createReadStream(filePath, {
    start: checkpoint.offset,
    end: fileStat.size - 1,
  });

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const previousPending = Buffer.from(checkpoint.pending, "base64");

  const content = Buffer.concat([previousPending, ...chunks]);

  let start = 0;
  let newlineIndex: number;

  while ((newlineIndex = content.indexOf(10, start)) !== -1) {
    const line = content.subarray(start, newlineIndex).toString("utf8").trim();

    start = newlineIndex + 1;

    if (line) {
      await forwardLine(line);
    }
  }

  checkpoint = {
    offset: fileStat.size,
    pending: content.subarray(start).toString("base64"),
    dev: fileStat.dev,
    ino: fileStat.ino,
  };

  checkpoints.set(filePath, checkpoint);

  await saveCheckpoint();
}

function queueRead(filePath: string) {
  const absolutePath = path.resolve(filePath);

  if (!appLogPattern.test(path.basename(absolutePath))) {
    return;
  }

  const previousJob = jobs.get(absolutePath) ?? Promise.resolve();

  const nextJob = previousJob
    .then(() => readNewContent(absolutePath))
    .catch((error) => {
      console.error("[Pinorama] File watcher error:", error);
    });

  jobs.set(absolutePath, nextJob);
}

async function startWatcher() {
  await mkdir(logDirectory, { recursive: true });
  await loadCheckpoint();

  const watcher = watch(logDirectory, {
    ignoreInitial: false,
    persistent: true,
  });

  watcher.on("add", queueRead);
  watcher.on("change", queueRead);

  watcher.on("ready", () => {
    console.error(`[Pinorama] Watching: ${logDirectory}`);
  });

  watcher.on("error", (error) => {
    console.error("[Pinorama] Watcher error:", error);
  });

  process.once("SIGINT", async () => {
    console.error("[Pinorama] Shutting down watcher...");

    await watcher.close();
    await Promise.all(jobs.values());
    await persistQueue;

    console.error("[Pinorama] Watcher stopped");
  });

  process.once("SIGTERM", async () => {
    await watcher.close();
    await Promise.all(jobs.values());
    await persistQueue;
  });
}

startWatcher().catch((error) => {
  console.error("[Pinorama] Failed to start:", error);
  process.exitCode = 1;
});
