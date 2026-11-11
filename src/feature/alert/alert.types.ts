export type AlertType = "text" | "mediashare";

export interface AlertPayload {
  type: AlertType;
  data: Record<string, unknown>
}
