import { toNodeHandler } from "better-auth/node";
import express from "express";
import { auth } from "./shared/lib/auth";
import { errorHandler } from "./shared/middlewares/error-handler";
import { env } from "./shared/config/env";
import apiRoute from "./shared/routes";
import { httpLogger } from "./shared/middlewares/logger.middleware";

const app = express();
const PORT = env.PORT;

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use(httpLogger);

app.use("/api", apiRoute);

app.use(errorHandler);

export default app;
