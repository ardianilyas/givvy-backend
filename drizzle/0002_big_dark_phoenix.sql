ALTER TABLE "creators" ADD COLUMN "alert_token" varchar(64);--> statement-breakpoint
ALTER TABLE "creators" ADD CONSTRAINT "creators_alert_token_unique" UNIQUE("alert_token");