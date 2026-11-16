import { logger } from "@/shared/lib/logger";
import { borderpayConfig } from "./borderpay.config";
import type { BorderPayDisbursementResponse, BorderPayPaymentResponse, CreateDisbursementParams, CreateQrisPaymentParams } from "./borderpay.types";

export async function createQrisPayment({
  amount, referenceId, returnUrl
}: CreateQrisPaymentParams): Promise<BorderPayPaymentResponse> {
  const response = await fetch(`${borderpayConfig.baseUrl}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${borderpayConfig.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      method: "qris",
      reference_id: referenceId,
      ...(returnUrl && { return_url: returnUrl }),
    }),
    signal: AbortSignal.timeout(15000),
  });

  const result = await response.json();

  if (!response.ok) throw new Error(`BorderPay error: ${response.status}`);

  return result as BorderPayPaymentResponse;
}

export async function createDisbursement(data: CreateDisbursementParams): Promise<BorderPayDisbursementResponse> {
  const response = await fetch(`${borderpayConfig.baseUrl}/disbursements`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${borderpayConfig.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(15000),
  });

  const result = await response.json() as BorderPayDisbursementResponse;

  if (!response.ok) {
    logger.error({ error: response.body }, "Failed to create disbursement");
    throw new Error(`BorderPay error: ${response.status}`);
  }

  return result as BorderPayDisbursementResponse;
}
