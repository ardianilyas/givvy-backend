CREATE TYPE "public"."withdrawal_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "creator_bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"bank_code" varchar(50) NOT NULL,
	"account_number_encrypted" text NOT NULL,
	"account_number_last4" varchar(4) NOT NULL,
	"account_name_encrypted" text NOT NULL,
	"is_default" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created-at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"bank_account_id" uuid,
	"bank_code" varchar(50) NOT NULL,
	"account_number_encrypted" text NOT NULL,
	"account_number_last4" varchar(4) NOT NULL,
	"account_name_encrypted" text NOT NULL,
	"amount" bigint NOT NULL,
	"platform_fee" bigint NOT NULL,
	"gateway_fee" bigint NOT NULL,
	"total_deducted" bigint NOT NULL,
	"status" "withdrawal_status" DEFAULT 'pending' NOT NULL,
	"reference_id" varchar(100) NOT NULL,
	"gateway_reference" varchar(150),
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator_bank_accounts" ADD CONSTRAINT "creator_bank_accounts_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_bank_account_id_creator_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."creator_bank_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "creator_bank_accounts_creator_id_idx" ON "creator_bank_accounts" USING btree ("creator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "creator_bank_accounts_default_idx" ON "creator_bank_accounts" USING btree ("creator_id") WHERE "creator_bank_accounts"."is_default" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "withdrawals_reference_id_idx" ON "withdrawals" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX "withdrawals_creator_id_idx" ON "withdrawals" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "withdrawals_status_idx" ON "withdrawals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "withdrawals_created_at_idx" ON "withdrawals" USING btree ("created_at");