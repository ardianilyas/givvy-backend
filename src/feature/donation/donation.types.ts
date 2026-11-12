export type BorderPayEvent =
  | "payment.paid"
  | "payment.expired"
  | "payment.failed";

export interface BorderPayWebhookPayload {
  event: BorderPayEvent;
  mode: "test" | "live";
  data: {
    reference_id: string;
    order_id: string;
    status: "pending" | "paid" | "expired" | "failed";
    amount: number;
    fee: number;
    merchant_receives: number;
    method: string;
  };
}
