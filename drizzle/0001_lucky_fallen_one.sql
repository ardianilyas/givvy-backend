ALTER TYPE "public"."role" ADD VALUE 'staff' BEFORE 'user';--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'creator' BEFORE 'user';--> statement-breakpoint
CREATE TABLE "creators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"username" varchar(50) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"description" text,
	"avatar_url" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false,
	"verified_until" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "creators_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DROP TABLE "categories" CASCADE;--> statement-breakpoint
ALTER TABLE "creators" ADD CONSTRAINT "creators_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;