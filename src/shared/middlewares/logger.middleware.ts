import { pinoHttp } from "pino-http";
import { logger } from "../lib/logger";
import { randomUUID } from "node:crypto";

export const httpLogger = pinoHttp({
  logger,

  quietReqLogger: true,

  genReqId(_req, res) {
    const requestId = randomUUID();

    res.setHeader("X-Request-Id", requestId);

    return requestId;
  },

  customLogLevel(_req, res, err) {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";

    return "info";
  },

  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} completed`;
  },

  customErrorMessage(req, res, err) {
    return `${req.method} ${req.url} failed: ${err.message}`;
  },

  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
      };
    },

    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
