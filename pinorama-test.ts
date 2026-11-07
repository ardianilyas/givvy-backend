import pino from "pino";

const logger = pino({
  level: "debug",
  transport: {
    target: "pinorama-transport",
    options: {
      url: "http://localhost:6200/pinorama",
      batchSize: 1,
      flushInterval: 500,
    },
  },
});

logger.info("Testing Pinorama connection");
logger.error("Testing Pinorama error");
