export const USER_QUEUE = {
  NAME: "user-maintenance",
} as const;

export const USER_JOB = {
  DELETE_UNVERIFIED: "delete-unverified-users",
} as const;

export const USER_SCHEDULER = {
  DELETE_UNVERIFIED_DAILY: "delete-unverified-users-daily",
} as const;

export const USER_JOB_CONFIG = {
  ATTEMPTS: 3,
  BACKOFF_DELAY: 5000,
  REMOVE_ON_COMPLETE: 1000,
  REMOVE_ON_FAIL: 5000,
  CONCURRENCY: 1,
} as const;

export const USER_CLEANUP_CONFIG = {
  UNVERIFIED_ACCOUNT_EXPIRY_DAYS: 30,
  SCHEDULE_CRON: "0 1 * * *",
  TIMEZONE: "Asia/Jakarta",
} as const;
