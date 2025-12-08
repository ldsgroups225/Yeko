-- Phase 17: School Life Management
-- Teacher Attendance, Student Attendance, Conduct Management

-- Teacher Attendance Table
CREATE TABLE IF NOT EXISTS "teacher_attendance" (
  "id" TEXT PRIMARY KEY,
  "teacher_id" TEXT NOT NULL REFERENCES "teachers"("id") ON DELETE CASCADE,
  "school_id" TEXT NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'present' CHECK ("status" IN ('present', 'late', 'absent', 'excused', 'on_leave')),
  "arrival_time" TEXT,
  "departure_time" TEXT,
  "late_minutes" INTEGER,
  "reason" TEXT,
  "notes" TEXT,
  "recorded_by" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "unique_teacher_date" UNIQUE ("teacher_id", "date")
);

CREATE INDEX IF NOT EXISTS "idx_teacher_attendance_teacher_date" ON "teacher_attendance"("teacher_id", "date");
CREATE INDEX IF NOT EXISTS "idx_teacher_attendance_school_date" ON "teacher_attendance"("school_id", "date");
CREATE INDEX IF NOT EXISTS "idx_teacher_attendance_status" ON "teacher_attendance"("status");
CREATE INDEX IF NOT EXISTS "idx_teacher_attendance_date_range" ON "teacher_attendance"("school_id", "date" DESC);

-- Student Attendance Table
CREATE TABLE IF NOT EXISTS "student_attendance" (
  "id" TEXT PRIMARY KEY,
  "student_id" TEXT NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "class_id" TEXT NOT NULL REFERENCES "classes"("id") ON DELETE CASCADE,
  "school_id" TEXT NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "class_session_id" TEXT REFERENCES "class_sessions"("id") ON DELETE SET NULL,
  "date" DATE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'present' CHECK ("status" IN ('present', 'late', 'absent', 'excused')),
  "arrival_time" TEXT,
  "late_minutes" INTEGER,
  "reason" TEXT,
  "reason_category" TEXT CHECK ("reason_category" IN ('illness', 'family', 'transport', 'weather', 'other', 'unexcused')),
  "excused_by" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "excused_at" TIMESTAMP,
  "parent_notified" BOOLEAN DEFAULT FALSE,
  "notified_at" TIMESTAMP,
  "notification_method" TEXT CHECK ("notification_method" IN ('email', 'sms', 'in_app')),
  "notes" TEXT,
  "recorded_by" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_student_attendance_student_date" ON "student_attendance"("student_id", "date");
CREATE INDEX IF NOT EXISTS "idx_student_attendance_class_date" ON "student_attendance"("class_id", "date");
CREATE INDEX IF NOT EXISTS "idx_student_attendance_session" ON "student_attendance"("class_session_id");
CREATE INDEX IF NOT EXISTS "idx_student_attendance_status" ON "student_attendance"("status");
CREATE INDEX IF NOT EXISTS "idx_student_attendance_school_date" ON "student_attendance"("school_id", "date" DESC);

-- Conduct Records Table
CREATE TABLE IF NOT EXISTS "conduct_records" (
  "id" TEXT PRIMARY KEY,
  "student_id" TEXT NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "school_id" TEXT NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "class_id" TEXT REFERENCES "classes"("id") ON DELETE SET NULL,
  "school_year_id" TEXT NOT NULL REFERENCES "school_years"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL CHECK ("type" IN ('incident', 'sanction', 'reward', 'note')),
  "category" TEXT NOT NULL CHECK ("category" IN ('behavior', 'academic', 'attendance', 'uniform', 'property', 'violence', 'bullying', 'cheating', 'achievement', 'improvement', 'other')),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "severity" TEXT CHECK ("severity" IN ('low', 'medium', 'high', 'critical')),
  "incident_date" DATE,
  "incident_time" TEXT,
  "location" TEXT,
  "witnesses" TEXT[],
  "sanction_type" TEXT CHECK ("sanction_type" IN ('verbal_warning', 'written_warning', 'detention', 'suspension', 'community_service', 'parent_meeting', 'expulsion', 'other')),
  "sanction_start_date" DATE,
  "sanction_end_date" DATE,
  "sanction_details" TEXT,
  "reward_type" TEXT CHECK ("reward_type" IN ('certificate', 'merit_points', 'public_recognition', 'prize', 'scholarship', 'other')),
  "points_awarded" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'open' CHECK ("status" IN ('open', 'investigating', 'pending_decision', 'resolved', 'closed', 'appealed')),
  "assigned_to" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "parent_notified" BOOLEAN DEFAULT FALSE,
  "parent_notified_at" TIMESTAMP,
  "parent_acknowledged" BOOLEAN DEFAULT FALSE,
  "parent_acknowledged_at" TIMESTAMP,
  "parent_response" TEXT,
  "attachments" JSONB DEFAULT '[]',
  "recorded_by" TEXT NOT NULL REFERENCES "users"("id"),
  "resolved_by" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "resolved_at" TIMESTAMP,
  "resolution_notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_conduct_student" ON "conduct_records"("student_id");
CREATE INDEX IF NOT EXISTS "idx_conduct_school_year" ON "conduct_records"("school_id", "school_year_id");
CREATE INDEX IF NOT EXISTS "idx_conduct_type" ON "conduct_records"("type");
CREATE INDEX IF NOT EXISTS "idx_conduct_category" ON "conduct_records"("category");
CREATE INDEX IF NOT EXISTS "idx_conduct_status" ON "conduct_records"("status");
CREATE INDEX IF NOT EXISTS "idx_conduct_severity" ON "conduct_records"("severity");
CREATE INDEX IF NOT EXISTS "idx_conduct_date" ON "conduct_records"("incident_date" DESC);
CREATE INDEX IF NOT EXISTS "idx_conduct_student_year" ON "conduct_records"("student_id", "school_year_id");

-- Conduct Follow-ups Table
CREATE TABLE IF NOT EXISTS "conduct_follow_ups" (
  "id" TEXT PRIMARY KEY,
  "conduct_record_id" TEXT NOT NULL REFERENCES "conduct_records"("id") ON DELETE CASCADE,
  "action" TEXT NOT NULL,
  "notes" TEXT,
  "outcome" TEXT,
  "follow_up_date" DATE,
  "completed_at" TIMESTAMP,
  "created_by" TEXT NOT NULL REFERENCES "users"("id"),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_follow_ups_conduct" ON "conduct_follow_ups"("conduct_record_id");
CREATE INDEX IF NOT EXISTS "idx_follow_ups_date" ON "conduct_follow_ups"("follow_up_date");

-- Attendance Alerts Table
CREATE TABLE IF NOT EXISTS "attendance_alerts" (
  "id" TEXT PRIMARY KEY,
  "school_id" TEXT NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "alert_type" TEXT NOT NULL CHECK ("alert_type" IN ('teacher_repeated_lateness', 'teacher_absence_streak', 'student_chronic_absence', 'student_attendance_drop', 'class_low_attendance')),
  "teacher_id" TEXT REFERENCES "teachers"("id") ON DELETE CASCADE,
  "student_id" TEXT REFERENCES "students"("id") ON DELETE CASCADE,
  "class_id" TEXT REFERENCES "classes"("id") ON DELETE CASCADE,
  "severity" TEXT NOT NULL CHECK ("severity" IN ('info', 'warning', 'critical')),
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "data" JSONB DEFAULT '{}',
  "status" TEXT NOT NULL DEFAULT 'active' CHECK ("status" IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  "acknowledged_by" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "acknowledged_at" TIMESTAMP,
  "resolved_at" TIMESTAMP,
  "notified_users" JSONB DEFAULT '[]',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "expires_at" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_alerts_school" ON "attendance_alerts"("school_id");
CREATE INDEX IF NOT EXISTS "idx_alerts_status" ON "attendance_alerts"("status");
CREATE INDEX IF NOT EXISTS "idx_alerts_type" ON "attendance_alerts"("alert_type");
CREATE INDEX IF NOT EXISTS "idx_alerts_teacher" ON "attendance_alerts"("teacher_id");
CREATE INDEX IF NOT EXISTS "idx_alerts_student" ON "attendance_alerts"("student_id");
CREATE INDEX IF NOT EXISTS "idx_alerts_active" ON "attendance_alerts"("school_id", "status") WHERE "status" = 'active';

-- Attendance Settings Table
CREATE TABLE IF NOT EXISTS "attendance_settings" (
  "id" TEXT PRIMARY KEY,
  "school_id" TEXT NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "teacher_expected_arrival" TEXT DEFAULT '07:30',
  "teacher_late_threshold_minutes" INTEGER DEFAULT 15,
  "teacher_lateness_alert_count" INTEGER DEFAULT 3,
  "student_late_threshold_minutes" INTEGER DEFAULT 10,
  "chronic_absence_threshold_percent" DECIMAL(5,2) DEFAULT 10.00,
  "notify_parent_on_absence" BOOLEAN DEFAULT TRUE,
  "notify_parent_on_late" BOOLEAN DEFAULT FALSE,
  "working_days" SMALLINT[] DEFAULT '{1,2,3,4,5}',
  "notification_methods" TEXT[] DEFAULT '{"email"}',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "unique_attendance_settings_school" UNIQUE ("school_id")
);

CREATE INDEX IF NOT EXISTS "idx_attendance_settings_school" ON "attendance_settings"("school_id");
