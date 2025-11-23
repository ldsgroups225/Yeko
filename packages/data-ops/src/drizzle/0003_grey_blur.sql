CREATE TABLE "activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"school_id" text,
	"action" text NOT NULL,
	"resource" text,
	"resource_id" text,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"endpoint" text NOT NULL,
	"method" text NOT NULL,
	"status_code" smallint NOT NULL,
	"response_time_ms" integer NOT NULL,
	"user_id" text,
	"school_id" text,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_metrics" ADD CONSTRAINT "api_metrics_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_metrics" ADD CONSTRAINT "api_metrics_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_activity_user_time" ON "activity_logs" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_activity_school_time" ON "activity_logs" USING btree ("school_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_activity_action_time" ON "activity_logs" USING btree ("action","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_activity_resource" ON "activity_logs" USING btree ("resource","resource_id");--> statement-breakpoint
CREATE INDEX "idx_api_endpoint_time" ON "api_metrics" USING btree ("endpoint","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_api_status_time" ON "api_metrics" USING btree ("status_code","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_api_user_time" ON "api_metrics" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_coeff_lookup" ON "coefficient_templates" USING btree ("school_year_template_id","grade_id","series_id","subject_id");--> statement-breakpoint
CREATE INDEX "idx_coeff_year" ON "coefficient_templates" USING btree ("school_year_template_id");--> statement-breakpoint
CREATE INDEX "idx_coeff_grade" ON "coefficient_templates" USING btree ("grade_id");--> statement-breakpoint
CREATE INDEX "idx_coeff_subject" ON "coefficient_templates" USING btree ("subject_id");