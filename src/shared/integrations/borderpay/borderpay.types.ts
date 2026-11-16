export interface CreateQrisPaymentParams {
  amount: number;
  referenceId: string;
  returnUrl?: string;
}

export interface BorderPayPaymentResponse {
  reference_id: string;
  status: "pending" | "paid" | "expired" | "failed";
  amount: number;
  customer_pays: number;
  merchant_receives: number;
  fee: number;
  fee_borne_by: "merchant" | "customer";
  pay_url: string;
  return_url?: string;
  qr_string: string;
  expires_at: string;
}

export interface CreateDisbursementParams {
  amount: number;
  bank_code: string;
  account_number: string;
  account_name: string;
  reference_id: string
}

export interface BorderPayDisbursementResponse {
  id: string;
  reference_id: string;
  status: "pending" | "completed" | "failed";
  amount: number;
  fee: number;
  total_deducted: number;
  bank_code: string;
  account_number: string;
  fail_reason: string | null;
}
