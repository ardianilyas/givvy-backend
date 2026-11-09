import { Resend } from "resend";
import { env } from "./env";
import { isProduction } from "../constants/global.constants";

const apiKey = env.RESEND_API_KEY;
export const emailFrom = env.EMAIL_FROM;
const devRecipient = "delivered@resend.dev";

export const recipient = (email: string) => isProduction ? email : devRecipient;

export const resend = new Resend(apiKey);
