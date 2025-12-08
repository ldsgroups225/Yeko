-- Phase 19: Yeko Teacher App - Database Schema
-- Migration: 0009_phase19_teacher_app.sql

-- Participation Grades Table
CREATE TABLE IF NOT EXISTS participation_grades (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_session_id TEXT NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  grade SMALLINT NOT NULL CHECK (grade >= 1 AND grade <= 5),
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_student_session_participation UNIQUE (student_id, class_session_id)
);

CREATE INDEX IF NOT EXISTS idx_participation_session ON participation_grades(class_session_id);
CREATE INDEX IF NOT EXISTS idx_participation_student ON participation_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_participation_teacher ON participation_grades(teacher_id);

-- Homework Table
CREATE TABLE IF NOT EXISTS homework (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_session_id TEXT REFERENCES class_sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  due_date DATE NOT NULL,
  due_time TEXT,
  max_points SMALLINT,
  is_graded BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homework_class ON homework(class_id);
CREATE INDEX IF NOT EXISTS idx_homework_teacher ON homework(teacher_id);
CREATE INDEX IF NOT EXISTS idx_homework_due_date ON homework(due_date);
CREATE INDEX IF NOT EXISTS idx_homework_status ON homework(status);
CREATE INDEX IF NOT EXISTS idx_homework_class_due ON homework(class_id, due_date);


-- Homework Submissions Table (for future use)
CREATE TABLE IF NOT EXISTS homework_submissions (
  id TEXT PRIMARY KEY,
  homework_id TEXT NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  content TEXT,
  attachments JSONB DEFAULT '[]',
  grade DECIMAL(5,2),
  graded_at TIMESTAMP,
  graded_by TEXT REFERENCES teachers(id) ON DELETE SET NULL,
  feedback TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'late', 'graded', 'returned')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_homework_student UNIQUE (homework_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_submission_homework ON homework_submissions(homework_id);
CREATE INDEX IF NOT EXISTS idx_submission_student ON homework_submissions(student_id);

-- Teacher Messages Table
CREATE TABLE IF NOT EXISTS teacher_messages (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('teacher', 'parent')),
  sender_id TEXT NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('teacher', 'parent')),
  recipient_id TEXT NOT NULL,
  student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  thread_id TEXT,
  reply_to_id TEXT REFERENCES teacher_messages(id) ON DELETE SET NULL,
  subject TEXT,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  is_archived BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON teacher_messages(sender_type, sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON teacher_messages(recipient_type, recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON teacher_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON teacher_messages(recipient_type, recipient_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_created ON teacher_messages(created_at DESC);


-- Message Templates Table
CREATE TABLE IF NOT EXISTS message_templates (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL CHECK (category IN ('attendance', 'grades', 'behavior', 'general', 'reminder', 'congratulations')),
  subject TEXT,
  content TEXT NOT NULL,
  placeholders JSONB DEFAULT '[]',
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_school ON message_templates(school_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON message_templates(category);

-- Teacher Notifications Table
CREATE TABLE IF NOT EXISTS teacher_notifications (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'grade_validation', 'schedule_change', 'attendance_alert', 'system', 'reminder')),
  title TEXT NOT NULL,
  body TEXT,
  action_type TEXT,
  action_data JSONB,
  related_type TEXT,
  related_id TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_teacher ON teacher_notifications(teacher_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON teacher_notifications(teacher_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON teacher_notifications(created_at DESC);

-- Extend class_sessions table
ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS participation_recorded BOOLEAN DEFAULT FALSE;
ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS homework_assigned BOOLEAN DEFAULT FALSE;
