CREATE TYPE "public"."donation_status" AS ENUM('pending', 'paid', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'expired');--> statement-breakpoint
CREATE TABLE "creator_balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"balance" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_balances_creator_id_unique" UNIQUE("creator_id")
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user-id" text NOT NULL,
	"creator_id" uuid NOT NULL,
	"amount" bigint NOT NULL,
	"message" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"status" "donation_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"donation_id" uuid NOT NULL,
	"provider" varchar(50) DEFAULT 'borderpay' NOT NULL,
	"reference_id" varchar(255) NOT NULL,
	"payment_url" text,
	"payment_method" varchar(50),
	"amount" bigint NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"expired_at" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator_balances" ADD CONSTRAINT "creator_balances_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_user-id_user_id_fk" FOREIGN KEY ("user-id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_donation_id_donations_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "donations_user_id_idx" ON "donations" USING btree ("user-id");--> statement-breakpoint
CREATE INDEX "donations_creator_id_idx" ON "donations" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "donations_status_idx" ON "donations" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_donation_id_idx" ON "payments" USING btree ("donation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_reference_id_idx" ON "payments" USING btree ("reference_id");