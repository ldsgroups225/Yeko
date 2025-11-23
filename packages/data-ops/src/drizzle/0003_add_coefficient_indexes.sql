-- Add composite index for fast coefficient lookups during average calculations
-- This index is CRITICAL for performance when calculating student averages
-- Query pattern: "Find coefficient for (year, grade, series, subject)"
CREATE INDEX IF NOT EXISTS idx_coeff_lookup ON coefficient_templates (
  school_year_template_id, 
  grade_id, 
  series_id, 
  subject_id
);

-- Add unique constraint to prevent duplicate coefficient configurations
-- Ensures only one coefficient exists per (year, grade, series, subject) combination
-- Note: Uses COALESCE for series_id to handle NULL values in unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_coeff_unique ON coefficient_templates (
  school_year_template_id, 
  grade_id, 
  COALESCE(series_id, ''), 
  subject_id
);

-- Add index on school_year_template_id for filtering
CREATE INDEX IF NOT EXISTS idx_coeff_year ON coefficient_templates (school_year_template_id);

-- Add index on grade_id for filtering
CREATE INDEX IF NOT EXISTS idx_coeff_grade ON coefficient_templates (grade_id);

-- Add index on subject_id for filtering
CREATE INDEX IF NOT EXISTS idx_coeff_subject ON coefficient_templates (subject_id);
