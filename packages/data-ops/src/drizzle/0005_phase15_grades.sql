-- Migration: Phase 15 - Grades Management System
-- This migration adds tables for student grades, grade validations, and student averages

-- Table: student_grades (Core Grade Storage)
CREATE TABLE IF NOT EXISTS student_grades (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id),
  term_id TEXT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL REFERENCES teachers(id),
  
  -- Grade Data
  value DECIMAL(5,2) NOT NULL CHECK (value >= 0 AND value <= 20),
  type TEXT NOT NULL CHECK (type IN ('quiz', 'test', 'exam', 'participation', 'homework', 'project')),
  weight SMALLINT NOT NULL DEFAULT 1 CHECK (weight >= 1 AND weight <= 10),
  description TEXT,
  grade_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Workflow Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'validated', 'rejected')),
  submitted_at TIMESTAMP,
  validated_at TIMESTAMP,
  validated_by TEXT REFERENCES users(id),
  rejection_reason TEXT,
  
  -- Audit
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Critical Performance Indexes for student_grades
CREATE INDEX IF NOT EXISTS idx_grades_student_term_subject ON student_grades(student_id, term_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_class_subject_term ON student_grades(class_id, subject_id, term_id);
CREATE INDEX IF NOT EXISTS idx_grades_teacher ON student_grades(teacher_id);
CREATE INDEX IF NOT EXISTS idx_grades_status ON student_grades(status);
CREATE INDEX IF NOT EXISTS idx_grades_term_status ON student_grades(term_id, status);
CREATE INDEX IF NOT EXISTS idx_grades_class_term ON student_grades(class_id, term_id);

-- Table: grade_validations (Audit Trail)
CREATE TABLE IF NOT EXISTS grade_validations (
  id TEXT PRIMARY KEY,
  grade_id TEXT NOT NULL REFERENCES student_grades(id) ON DELETE CASCADE,
  validator_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL CHECK (action IN ('submitted', 'validated', 'rejected', 'edited')),
  previous_value DECIMAL(5,2),
  new_value DECIMAL(5,2),
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for grade_validations
CREATE INDEX IF NOT EXISTS idx_validations_grade ON grade_validations(grade_id);
CREATE INDEX IF NOT EXISTS idx_validations_validator ON grade_validations(validator_id);

-- Table: student_averages (Denormalized for Performance)
CREATE TABLE IF NOT EXISTS student_averages (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  term_id TEXT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES subjects(id), -- NULL for overall average
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  
  -- Calculated Values
  average DECIMAL(5,2) NOT NULL,
  weighted_average DECIMAL(5,2),
  grade_count INTEGER NOT NULL DEFAULT 0,
  rank_in_class SMALLINT,
  rank_in_grade SMALLINT,
  
  -- Metadata
  calculated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_final BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for student_averages
CREATE INDEX IF NOT EXISTS idx_averages_student_term ON student_averages(student_id, term_id);
CREATE INDEX IF NOT EXISTS idx_averages_class_term ON student_averages(class_id, term_id);
CREATE UNIQUE INDEX IF NOT EXISTS unique_student_term_subject ON student_averages(student_id, term_id, subject_id);
