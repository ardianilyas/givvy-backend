export const CREATOR_NOT_FOUND = "Creator not found";
export const USER_ALREADY_HAVE_CREATOR_ACCOUNT_FORBIDDEN = "You're already have creator account";
export const USERNAME_ALREADY_TAKEN = "Username already taken";

export const CREATOR_QUEUE_NAME = "creator-queue";
export const CREATOR_JOBS = {
  SEND_WELCOME_CREATOR_EMAIL: "send-welcome-creator-email",
} as const;

export const EMAIL_TEMPLATES = {
  CREATOR_WELCOME: "creator-welcome",
} as const;

export interface CreatorWelcomeEmailData {
  creatorName: string;
}

export interface EmailJobData {
  template: typeof EMAIL_TEMPLATES.CREATOR_WELCOME,
  to: string;
  subject: string;
  data: CreatorWelcomeEmailData;
}

export const CREATOR_SUCCESS_MESSAGE = {
  GET_CREATORS: "Creator list",
  GET_CREATOR: "Creator data",
  CREATE_CREATOR: "Creator created",
  UPDATE_CREATOR: "Creator updated",
  VERIFY_CREATOR: "Creator verified",
  GENERATE_ALERT_TOKEN: "Alert token generated",
}

export const CREATOR_POLICY_ERROR_MESSAGE = {
  UPDATE: "You can't update this resource",
  GENERATE_ALERT_TOKEN: "You can't generate alert token for this resource",
}

export const CREATOR_BASE_URL = "/api/creators";

export const CREATOR_TEST_ROUTE = {
  GET_CREATORS: `${CREATOR_BASE_URL}`,
  GET_CREATOR_BY_USERNAME: (username: string) => `${CREATOR_BASE_URL}/${username}`,
  CREATE_CREATOR: `${CREATOR_BASE_URL}`,
  UPDATE_CREATOR: (id: string) => `${CREATOR_BASE_URL}/${id}`,
  VERIFY_CREATOR: (id: string) => `${CREATOR_BASE_URL}/${id}/verify`,
  GENERATE_ALERT_TOKEN: (id: string) => `${CREATOR_BASE_URL}/${id}/generate-alert-token`,
}
