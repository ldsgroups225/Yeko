-- Custom migration: Add partial unique index for active enrollments
-- This prevents duplicate active enrollments per student per school year
-- Drizzle doesn't support partial indexes, so this is added manually

CREATE UNIQUE INDEX IF NOT EXISTS unique_student_year_active 
ON enrollments (student_id, school_year_id) 
WHERE status NOT IN ('cancelled', 'transferred');
