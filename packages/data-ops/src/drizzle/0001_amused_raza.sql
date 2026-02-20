CREATE TABLE "tracking_events" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"school_id" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"accuracy" numeric(8, 2),
	"type" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "longitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_tracking_session" ON "tracking_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_tracking_teacher" ON "tracking_events" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "idx_tracking_school" ON "tracking_events" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_tracking_timestamp" ON "tracking_events" USING btree ("timestamp");