DROP INDEX "idx_homework_teacher";--> statement-breakpoint
DROP INDEX "idx_student_attendance_class_date";--> statement-breakpoint
DROP INDEX "idx_student_attendance_school_date";--> statement-breakpoint
DROP INDEX "idx_grades_teacher";--> statement-breakpoint
DROP INDEX "idx_messages_recipient";--> statement-breakpoint
DROP INDEX "idx_messages_thread";--> statement-breakpoint
DROP INDEX "idx_timetable_school_year";--> statement-breakpoint
ALTER TABLE "attendance_alerts" ALTER COLUMN "data" DROP DEFAULT;--> statement-breakpoint
CREATE INDEX "idx_enrollments_student_year_status" ON "enrollments" USING btree ("student_id","school_year_id","status");--> statement-breakpoint
CREATE INDEX "idx_homework_teacher_status" ON "homework" USING btree ("teacher_id","status");--> statement-breakpoint
CREATE INDEX "idx_student_attendance_class_date_session" ON "student_attendance" USING btree ("class_id","date","class_session_id");--> statement-breakpoint
CREATE INDEX "idx_student_attendance_school_date_status" ON "student_attendance" USING btree ("school_id","date","status");--> statement-breakpoint
CREATE INDEX "idx_averages_class_term_final" ON "student_averages" USING btree ("class_id","term_id","is_final");--> statement-breakpoint
CREATE INDEX "idx_grades_teacher_status" ON "student_grades" USING btree ("teacher_id","status");--> statement-breakpoint
CREATE INDEX "idx_messages_recipient_archived" ON "teacher_messages" USING btree ("recipient_type","recipient_id","is_archived");--> statement-breakpoint
CREATE INDEX "idx_messages_thread_created" ON "teacher_messages" USING btree ("thread_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_timetable_school_year_day" ON "timetable_sessions" USING btree ("school_id","school_year_id","day_of_week");--> statement-breakpoint
ALTER TABLE "student_attendance" ADD CONSTRAINT "unique_student_attendance" UNIQUE NULLS NOT DISTINCT("student_id","date","class_id","class_session_id");