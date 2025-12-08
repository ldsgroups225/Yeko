-- Phase 16: Report Cards, Timetables, and Curriculum Progress
-- Migration: 0006_phase16_report_cards.sql
-- Date: December 8, 2025

-- ============================================
-- REPORT CARDS TABLES
-- ============================================

-- Report Card Templates (Customizable Templates)
CREATE TABLE IF NOT EXISTS "report_card_templates" (
  "id" TEXT PRIMARY KEY,
  "school_id" TEXT NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "is_default" BOOLEAN DEFAULT FALSE,
  "config" JSONB NOT NULL DEFAULT '{}',
  "primary_color" TEXT DEFAULT '#1e40af',
  "font_family" TEXT DEFAULT 'DM Sans',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_report_templates_school" ON "report_card_templates"("school_id");

-- Report Cards (Report Card Records)
CREATE TABLE IF NOT EXISTS "report_cards" (
  "id" TEXT PRIMARY KEY,
  "student_id" TEXT NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "class_id" TEXT NOT NULL REFERENCES "classes"("id") ON DELETE CASCADE,
  "term_id" TEXT NOT NULL REFERENCES "terms"("id") ON DELETE CASCADE,
  "school_year_id" TEXT NOT NULL REFERENCES "school_years"("id") ON DELETE CASCADE,
  "template_id" TEXT REFERENCES "report_card_templates"("id") ON DELETE SET NULL,
  
  -- Status & Workflow
  "status" TEXT NOT NULL DEFAULT 'draft' CHECK ("status" IN ('draft', 'generated', 'sent', 'delivered', 'viewed')),
  "generated_at" TIMESTAMP,
  "generated_by" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  
  -- PDF Storage
  "pdf_url" TEXT,
  "pdf_size" INTEGER,
  
  -- Delivery Tracking
  "sent_at" TIMESTAMP,
  "sent_to" TEXT,
  "delivery_method" TEXT CHECK ("delivery_method" IN ('email', 'in_app', 'sms', 'print')),
  "delivered_at" TIMESTAMP,
  "viewed_at" TIMESTAMP,
  "bounce_reason" TEXT,
  
  -- Comments
  "homeroom_comment" TEXT,
  "conduct_summary" TEXT,
  "attendance_summary" JSONB,
  
  -- Metadata
  "template_version" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "unique_student_term" UNIQUE ("student_id", "term_id")
);

CREATE INDEX IF NOT EXISTS "idx_report_cards_class_term" ON "report_cards"("class_id", "term_id");
CREATE INDEX IF NOT EXISTS "idx_report_cards_status" ON "report_cards"("status");
CREATE INDEX IF NOT EXISTS "idx_report_cards_student" ON "report_cards"("student_id");
CREATE INDEX IF NOT EXISTS "idx_report_cards_school_year" ON "report_cards"("school_year_id");

-- Teacher Comments (Subject-Specific Comments)
CREATE TABLE IF NOT EXISTS "teacher_comments" (
  "id" TEXT PRIMARY KEY,
  "report_card_id" TEXT NOT NULL REFERENCES "report_cards"("id") ON DELETE CASCADE,
  "subject_id" TEXT NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,
  "teacher_id" TEXT NOT NULL REFERENCES "teachers"("id") ON DELETE CASCADE,
  "comment" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "unique_report_subject" UNIQUE ("report_card_id", "subject_id")
);

CREATE INDEX IF NOT EXISTS "idx_teacher_comments_report" ON "teacher_comments"("report_card_id");
CREATE INDEX IF NOT EXISTS "idx_teacher_comments_teacher" ON "teacher_comments"("teacher_id");

-- ============================================
-- TIMETABLE TABLES
-- ============================================

-- Timetable Sessions (Schedule Entries)
CREATE TABLE IF NOT EXISTS "timetable_sessions" (
  "id" TEXT PRIMARY KEY,
  "school_id" TEXT NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "school_year_id" TEXT NOT NULL REFERENCES "school_years"("id") ON DELETE CASCADE,
  "class_id" TEXT NOT NULL REFERENCES "classes"("id") ON DELETE CASCADE,
  "subject_id" TEXT NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,
  "teacher_id" TEXT NOT NULL REFERENCES "teachers"("id") ON DELETE CASCADE,
  "classroom_id" TEXT REFERENCES "classrooms"("id") ON DELETE SET NULL,
  
  "day_of_week" SMALLINT NOT NULL CHECK ("day_of_week" >= 1 AND "day_of_week" <= 7),
  "start_time" TIME NOT NULL,
  "end_time" TIME NOT NULL,
  
  "effective_from" DATE,
  "effective_until" DATE,
  "is_recurring" BOOLEAN DEFAULT TRUE,
  
  "notes" TEXT,
  "color" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "valid_time_range" CHECK ("end_time" > "start_time")
);

CREATE INDEX IF NOT EXISTS "idx_timetable_class_day" ON "timetable_sessions"("class_id", "day_of_week");
CREATE INDEX IF NOT EXISTS "idx_timetable_teacher_day" ON "timetable_sessions"("teacher_id", "day_of_week");
CREATE INDEX IF NOT EXISTS "idx_timetable_classroom_day" ON "timetable_sessions"("classroom_id", "day_of_week");
CREATE INDEX IF NOT EXISTS "idx_timetable_conflicts" ON "timetable_sessions"("school_id", "day_of_week", "start_time", "end_time");
CREATE INDEX IF NOT EXISTS "idx_timetable_school_year" ON "timetable_sessions"("school_id", "school_year_id");

-- Class Sessions (Actual Teaching Sessions - for progress tracking)
CREATE TABLE IF NOT EXISTS "class_sessions" (
  "id" TEXT PRIMARY KEY,
  "class_id" TEXT NOT NULL REFERENCES "classes"("id") ON DELETE CASCADE,
  "subject_id" TEXT NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,
  "teacher_id" TEXT NOT NULL REFERENCES "teachers"("id") ON DELETE CASCADE,
  "chapter_id" TEXT REFERENCES "program_template_chapters"("id") ON DELETE SET NULL,
  "timetable_session_id" TEXT REFERENCES "timetable_sessions"("id") ON DELETE SET NULL,
  
  "date" DATE NOT NULL,
  "start_time" TIME NOT NULL,
  "end_time" TIME NOT NULL,
  "topic" TEXT,
  "objectives" TEXT,
  "homework" TEXT,
  
  "status" TEXT NOT NULL DEFAULT 'scheduled' CHECK ("status" IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  "completed_at" TIMESTAMP,
  
  "students_present" INTEGER,
  "students_absent" INTEGER,
  "notes" TEXT,
  "attachments" JSONB,
  
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_class_sessions_class_subject" ON "class_sessions"("class_id", "subject_id");
CREATE INDEX IF NOT EXISTS "idx_class_sessions_chapter" ON "class_sessions"("chapter_id");
CREATE INDEX IF NOT EXISTS "idx_class_sessions_date" ON "class_sessions"("date");
CREATE INDEX IF NOT EXISTS "idx_class_sessions_teacher" ON "class_sessions"("teacher_id");
CREATE INDEX IF NOT EXISTS "idx_class_sessions_status" ON "class_sessions"("status");

-- ============================================
-- CURRICULUM PROGRESS TABLES
-- ============================================

-- Curriculum Progress (Denormalized Progress Tracking)
CREATE TABLE IF NOT EXISTS "curriculum_progress" (
  "id" TEXT PRIMARY KEY,
  "class_id" TEXT NOT NULL REFERENCES "classes"("id") ON DELETE CASCADE,
  "subject_id" TEXT NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,
  "program_template_id" TEXT NOT NULL REFERENCES "program_templates"("id") ON DELETE CASCADE,
  "term_id" TEXT NOT NULL REFERENCES "terms"("id") ON DELETE CASCADE,
  
  "total_chapters" INTEGER NOT NULL DEFAULT 0,
  "completed_chapters" INTEGER NOT NULL DEFAULT 0,
  "progress_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
  
  "expected_percentage" DECIMAL(5,2),
  "variance" DECIMAL(5,2),
  
  "status" TEXT NOT NULL DEFAULT 'on_track' CHECK ("status" IN ('on_track', 'slightly_behind', 'significantly_behind', 'ahead')),
  
  "last_chapter_completed_at" TIMESTAMP,
  "calculated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "unique_class_subject_term" UNIQUE ("class_id", "subject_id", "term_id")
);

CREATE INDEX IF NOT EXISTS "idx_progress_class" ON "curriculum_progress"("class_id");
CREATE INDEX IF NOT EXISTS "idx_progress_status" ON "curriculum_progress"("status");
CREATE INDEX IF NOT EXISTS "idx_progress_term" ON "curriculum_progress"("term_id");
CREATE INDEX IF NOT EXISTS "idx_progress_subject" ON "curriculum_progress"("subject_id");

-- Chapter Completions (Track which chapters are completed)
CREATE TABLE IF NOT EXISTS "chapter_completions" (
  "id" TEXT PRIMARY KEY,
  "class_id" TEXT NOT NULL REFERENCES "classes"("id") ON DELETE CASCADE,
  "subject_id" TEXT NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,
  "chapter_id" TEXT NOT NULL REFERENCES "program_template_chapters"("id") ON DELETE CASCADE,
  "class_session_id" TEXT REFERENCES "class_sessions"("id") ON DELETE SET NULL,
  "teacher_id" TEXT NOT NULL REFERENCES "teachers"("id") ON DELETE CASCADE,
  
  "completed_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "notes" TEXT,
  
  CONSTRAINT "unique_class_chapter" UNIQUE ("class_id", "chapter_id")
);

CREATE INDEX IF NOT EXISTS "idx_chapter_completions_class" ON "chapter_completions"("class_id", "subject_id");
CREATE INDEX IF NOT EXISTS "idx_chapter_completions_chapter" ON "chapter_completions"("chapter_id");
