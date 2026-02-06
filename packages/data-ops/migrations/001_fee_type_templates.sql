-- Migration: Create fee_type_templates table
-- Description: Adds core-level fee type templates for SaaS architecture

-- Create fee_type_templates table (core level)
CREATE TABLE IF NOT EXISTS fee_type_templates (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL,
  description TEXT,
  default_amount INTEGER,
  is_mandatory BOOLEAN DEFAULT FALSE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE NOT NULL,
  display_order SMALLINT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fee_template_category ON fee_type_templates(category);
CREATE INDEX IF NOT EXISTS idx_fee_template_active ON fee_type_templates(is_active);

-- Add fee_type_template_id foreign key to existing fee_types table
ALTER TABLE fee_types ADD COLUMN IF NOT EXISTS fee_type_template_id TEXT REFERENCES fee_type_templates(id);

-- Create index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_fee_types_template ON fee_types(fee_type_template_id);

-- Create unique constraint for school + template combination (allows NULL templates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_fee_types_school_template ON fee_types(school_id, fee_type_template_id) WHERE fee_type_template_id IS NOT NULL;

-- Seed core fee type templates
INSERT INTO fee_type_templates (id, code, name, name_en, category, description, default_amount, is_mandatory, is_recurring, display_order, is_active)
VALUES
  ('ftpl-tuition-001', 'TUITION', 'Frais de Scolarité', 'Tuition Fee', 'tuition', 'Annual tuition fees for academic enrollment', 150000, TRUE, TRUE, 1, TRUE),
  ('ftpl-registration-001', 'REGISTRATION', 'Frais d''Inscription', 'Registration Fee', 'registration', 'One-time registration and enrollment fees', 50000, TRUE, FALSE, 2, TRUE),
  ('ftpl-exam-001', 'EXAM', 'Frais d''Examen', 'Exam Fee', 'exam', 'Fees for official examinations and assessments', 25000, TRUE, FALSE, 3, TRUE),
  ('ftpl-books-001', 'BOOKS', 'Frais de Livres', 'Books Fee', 'books', 'Textbooks and educational materials', 30000, FALSE, FALSE, 4, TRUE),
  ('ftpl-transport-001', 'TRANSPORT', 'Frais de Transport', 'Transport Fee', 'transport', 'School bus and transportation services', 45000, FALSE, TRUE, 5, TRUE),
  ('ftpl-uniform-001', 'UNIFORM', 'Frais de Uniforme', 'Uniform Fee', 'uniform', 'School uniform and sportswear', 20000, FALSE, FALSE, 6, TRUE),
  ('ftpl-meals-001', 'MEALS', 'Frais de Cantine', 'Meals Fee', 'meals', 'School cafeteria and meal plans', 35000, FALSE, TRUE, 7, TRUE),
  ('ftpl-activities-001', 'ACTIVITIES', 'Frais d''Activités', 'Activities Fee', 'activities', 'Extracurricular activities and sports', 15000, FALSE, FALSE, 8, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Verify the migration
SELECT 'fee_type_templates created' as status, COUNT(*) as count FROM fee_type_templates;
