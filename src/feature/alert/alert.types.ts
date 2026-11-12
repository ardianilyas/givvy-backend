export type AlertType = "text" | "mediashare";

export interface AlertPayload {
  type: AlertType;
  donationId: string;
  data: Record<string, unknown>
}
