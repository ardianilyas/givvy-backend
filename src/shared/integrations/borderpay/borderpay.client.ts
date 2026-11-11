import { borderpayConfig } from "./borderpay.config";
import type { BorderPayPaymentResponse, CreateQrisPaymentParams } from "./borderpay.types";

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
