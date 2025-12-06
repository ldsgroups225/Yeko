-- Migration: Phase 14 - School Subjects Configuration
-- This migration adds the school_subjects table and optimizes indexes for coefficient lookups

-- New table: school_subjects
-- Stores subjects that are activated for a specific school in a given school year
CREATE TABLE IF NOT EXISTS school_subjects (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  school_year_id TEXT NOT NULL REFERENCES school_years(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for school_subjects
CREATE INDEX IF NOT EXISTS idx_school_subjects_school ON school_subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_school_subjects_year ON school_subjects(school_year_id);
CREATE INDEX IF NOT EXISTS idx_school_subjects_status ON school_subjects(status);
CREATE INDEX IF NOT EXISTS idx_school_subjects_lookup ON school_subjects(school_id, school_year_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS unique_school_subject_year ON school_subjects(school_id, subject_id, school_year_id);

-- Additional index for school_subject_coefficients (Phase 14 optimization)
CREATE INDEX IF NOT EXISTS idx_school_coeffs_lookup ON school_subject_coefficients(school_id, coefficient_template_id);
