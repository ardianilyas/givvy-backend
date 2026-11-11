import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", 
  ["admin", "staff", "creator", "user"]
);

export const donationStatusEnum = pgEnum("donation_status", [
  "pending", "paid", "failed", "expired"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending", "paid", "failed", "expired"
]);
