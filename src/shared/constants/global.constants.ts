import { env } from "../config/env";

export const isProduction = env.NODE_ENV === "production";
