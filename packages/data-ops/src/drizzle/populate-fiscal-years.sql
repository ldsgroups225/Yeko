-- Migration: Populate fiscal_years from existing school_years
-- This migration creates fiscal_year records for all existing school years that don't have one

INSERT INTO fiscal_years (id, school_id, school_year_id, name, start_date, end_date, status, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    sy.school_id,
    sy.id as school_year_id,
    'FY ' || EXTRACT(YEAR FROM sy.start_date::date) || '-' || EXTRACT(YEAR FROM sy.end_date::date) as name,
    sy.start_date,
    sy.end_date,
    'open' as status,
    NOW() as created_at,
    NOW() as updated_at
FROM school_years sy
LEFT JOIN fiscal_years fy ON fy.school_year_id = sy.id
WHERE fy.id IS NULL;
