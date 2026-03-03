CREATE TABLE "grade_series" (
	"id" text PRIMARY KEY NOT NULL,
	"grade_id" text NOT NULL,
	"series_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_grade_series" UNIQUE("grade_id","series_id")
);
--> statement-breakpoint
ALTER TABLE "grade_series" ADD CONSTRAINT "grade_series_grade_id_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade_series" ADD CONSTRAINT "grade_series_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_grade_series_grade" ON "grade_series" USING btree ("grade_id");--> statement-breakpoint
CREATE INDEX "idx_grade_series_series" ON "grade_series" USING btree ("series_id");