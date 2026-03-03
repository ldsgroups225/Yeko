-- Phase 4: Composite indexes for high-frequency read paths
-- Targets: timetable_sessions, conduct_records, curriculum_progress,
--          enrollments join path, installments overdue path

-- Timetable sessions: class+year, teacher+year, classroom+year lookups
CREATE INDEX "idx_timetable_class_year" ON "timetable_sessions" USING btree ("class_id","school_year_id","day_of_week","start_time");
--> statement-breakpoint
CREATE INDEX "idx_timetable_teacher_year" ON "timetable_sessions" USING btree ("teacher_id","school_year_id","day_of_week","start_time");
--> statement-breakpoint
CREATE INDEX "idx_timetable_classroom_year" ON "timetable_sessions" USING btree ("classroom_id","school_year_id","day_of_week","start_time");

--> statement-breakpoint
-- Conduct records: school+year list ordered by created_at (primary list query)
CREATE INDEX "idx_conduct_school_year_created" ON "conduct_records" USING btree ("school_id","school_year_id","created_at" DESC);

--> statement-breakpoint
-- Curriculum progress: class+term composite (EXPLAIN target query)
CREATE INDEX "idx_progress_class_term" ON "curriculum_progress" USING btree ("class_id","term_id","calculated_at" DESC);

--> statement-breakpoint
-- Enrollments: optimized join path for students-list-by-year query
-- Query pattern: JOIN enrollments ON student_id WHERE school_year_id = $1 AND status = 'confirmed'
CREATE INDEX "idx_enrollments_year_status_student" ON "enrollments" USING btree ("school_year_id","status","student_id");

--> statement-breakpoint
-- Installments: overdue calculation path (due_date < NOW AND balance > 0)
CREATE INDEX "idx_installments_plan_due_balance" ON "installments" USING btree ("payment_plan_id","due_date") WHERE "balance" > 0;

--> statement-breakpoint
-- Finance stats: payments aggregation by school_id + status
CREATE INDEX "idx_payments_school_status" ON "payments" USING btree ("school_id","status") WHERE "status" = 'completed';

--> statement-breakpoint
-- Report cards: class+term lookup (primary list query)
CREATE INDEX "idx_report_cards_class_term_created" ON "report_cards" USING btree ("class_id","term_id","created_at" DESC);
