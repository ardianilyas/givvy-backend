export const CREATOR_NOT_FOUND = "Creator not found";

export const WITHDRAWAL_BASE_URL = "/api/withdrawals";
export const INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE";

export const WITHDRAWAL_ROUTE_TEST = {
  WITHDRAW: (creatorId: string) => `${WITHDRAWAL_BASE_URL}/${creatorId}/withdraw`,
}
