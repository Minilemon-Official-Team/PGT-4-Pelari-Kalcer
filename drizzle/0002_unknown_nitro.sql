ALTER TABLE "creator_request" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "creator_request" ADD COLUMN "submitted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint
CREATE UNIQUE INDEX "pending_request_unique" ON "creator_request" USING btree ("user_id") WHERE status = 'pending';