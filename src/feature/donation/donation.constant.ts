export const BASE_URL = "/api/donations";

export const DONATION_TEST_ROUTE = {
  DONATE: `${BASE_URL}`,
}

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  EXPIRED: "expired",
} as const;

export const DONATION_STATUS = PAYMENT_STATUS;

export const BORDERPAY_EVENTS = {
  PAID: "payment.paid",
  FAILED: "payment.failed",
  EXPIRED: "payment.expired",
} as const;

export type PaymentWebhookData = {
  paymentId: string;
  paymentStatus: string;
  paymentAmount: string | number;
  donationId: string;
  donationAmount: string | number;
  donationMessage: string | null;
  creatorId: string;
  alertToken: string;
};
