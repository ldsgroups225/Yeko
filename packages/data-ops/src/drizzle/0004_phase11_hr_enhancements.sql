-- Phase 11: HR Management Module - Database Enhancements
-- Migration: 0004_phase11_hr_enhancements.sql
-- Date: 2025-11-28

-- Add isSystemRole column to roles table
ALTER TABLE "roles" ADD COLUMN "is_system_role" boolean DEFAULT false NOT NULL;

-- Add lastLoginAt column to users table
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;

-- Update existing system roles to mark them as system roles
UPDATE "roles" SET "is_system_role" = true 
WHERE "slug" IN (
  'school-administrator',
  'academic-coordinator',
  'discipline-officer',
  'accountant',
  'cashier',
  'registrar'
);

-- Create full-text search indexes for users
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS "idx_users_name_search" ON "users" USING gin("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_users_email_search" ON "users" USING gin("email" gin_trgm_ops);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS "idx_user_roles_role_school" ON "user_roles"("role_id", "school_id");
CREATE INDEX IF NOT EXISTS "idx_teachers_school_status_active" ON "teachers"("school_id", "status") WHERE "status" = 'active';

-- Add index for last login tracking
CREATE INDEX IF NOT EXISTS "idx_users_last_login" ON "users"("last_login_at" DESC NULLS LAST);

-- Add index for system roles
CREATE INDEX IF NOT EXISTS "idx_roles_system" ON "roles"("is_system_role");

-- Comments for documentation
COMMENT ON COLUMN "roles"."is_system_role" IS 'Prevents deletion of system-defined roles';
COMMENT ON COLUMN "users"."last_login_at" IS 'Timestamp of user last login for activity tracking';
