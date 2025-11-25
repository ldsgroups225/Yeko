ALTER TABLE "coefficient_templates" DROP CONSTRAINT "coefficient_templates_subject_id_subjects_id_fk";
--> statement-breakpoint
ALTER TABLE "coefficient_templates" DROP CONSTRAINT "coefficient_templates_grade_id_grades_id_fk";
--> statement-breakpoint
ALTER TABLE "coefficient_templates" DROP CONSTRAINT "coefficient_templates_series_id_series_id_fk";
--> statement-breakpoint
ALTER TABLE "grades" DROP CONSTRAINT "grades_track_id_tracks_id_fk";
--> statement-breakpoint
ALTER TABLE "program_template_chapters" DROP CONSTRAINT "program_template_chapters_program_template_id_program_templates_id_fk";
--> statement-breakpoint
ALTER TABLE "series" DROP CONSTRAINT "series_track_id_tracks_id_fk";
--> statement-breakpoint
ALTER TABLE "coefficient_templates" ADD CONSTRAINT "coefficient_templates_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coefficient_templates" ADD CONSTRAINT "coefficient_templates_grade_id_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coefficient_templates" ADD CONSTRAINT "coefficient_templates_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_template_chapters" ADD CONSTRAINT "program_template_chapters_program_template_id_program_templates_id_fk" FOREIGN KEY ("program_template_id") REFERENCES "public"."program_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE cascade ON UPDATE no action;