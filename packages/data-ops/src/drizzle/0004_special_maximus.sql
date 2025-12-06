CREATE TABLE "school_subjects" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"school_year_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_school_subject_year" UNIQUE("school_id","subject_id","school_year_id")
);
--> statement-breakpoint
ALTER TABLE "school_subjects" ADD CONSTRAINT "school_subjects_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_subjects" ADD CONSTRAINT "school_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_subjects" ADD CONSTRAINT "school_subjects_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_school_subjects_school" ON "school_subjects" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_school_subjects_year" ON "school_subjects" USING btree ("school_year_id");--> statement-breakpoint
CREATE INDEX "idx_school_subjects_status" ON "school_subjects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_school_subjects_lookup" ON "school_subjects" USING btree ("school_id","school_year_id","status");--> statement-breakpoint
CREATE INDEX "idx_school_coeffs_lookup" ON "school_subject_coefficients" USING btree ("school_id","coefficient_template_id");