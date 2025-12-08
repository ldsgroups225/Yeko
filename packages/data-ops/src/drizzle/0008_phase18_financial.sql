-- Phase 18: Financial Management
-- Migration: 0008_phase18_financial.sql
-- Date: December 8, 2025

-- ============================================
-- CHART OF ACCOUNTS
-- ============================================

CREATE TABLE IF NOT EXISTS "accounts" (
  "id" text PRIMARY KEY NOT NULL,
  "school_id" text NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "code" text NOT NULL,
  "name" text NOT NULL,
  "name_en" text,
  "type" text NOT NULL,
  "parent_id" text REFERENCES "accounts"("id") ON DELETE SET NULL,
  "level" smallint NOT NULL DEFAULT 1,
  "is_header" boolean DEFAULT false,
  "balance" decimal(15, 2) DEFAULT '0',
  "normal_balance" text NOT NULL,
  "description" text,
  "is_system" boolean DEFAULT false,
  "status" text DEFAULT 'active',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "accounts_type_check" CHECK ("type" IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  CONSTRAINT "accounts_normal_balance_check" CHECK ("normal_balance" IN ('debit', 'credit')),
  CONSTRAINT "accounts_status_check" CHECK ("status" IN ('active', 'inactive')),
  CONSTRAINT "unique_school_account_code" UNIQUE ("school_id", "code")
);

CREATE INDEX IF NOT EXISTS "idx_accounts_school" ON "accounts"("school_id");
CREATE INDEX IF NOT EXISTS "idx_accounts_parent" ON "accounts"("parent_id");
CREATE INDEX IF NOT EXISTS "idx_accounts_type" ON "accounts"("type");
CREATE INDEX IF NOT EXISTS "idx_accounts_code" ON "accounts"("school_id", "code");
CREATE INDEX IF NOT EXISTS "idx_accounts_hierarchy" ON "accounts"("school_id", "level", "parent_id");

-- ============================================
-- FISCAL YEARS
-- ============================================

CREATE TABLE IF NOT EXISTS "fiscal_years" (
  "id" text PRIMARY KEY NOT NULL,
  "school_id" text NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "school_year_id" text NOT NULL REFERENCES "school_years"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "status" text DEFAULT 'open',
  "closed_at" timestamp,
  "closed_by" text REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "fiscal_years_status_check" CHECK ("status" IN ('open', 'closed', 'locked')),
  CONSTRAINT "unique_school_fiscal_year" UNIQUE ("school_id", "school_year_id")
);

CREATE INDEX IF NOT EXISTS "idx_fiscal_years_school" ON "fiscal_years"("school_id");
CREATE INDEX IF NOT EXISTS "idx_fiscal_years_status" ON "fiscal_years"("status");
CREATE INDEX IF NOT EXISTS "idx_fiscal_years_dates" ON "fiscal_years"("school_id", "start_date", "end_date");


-- ============================================
-- FEE TYPES
-- ============================================

CREATE TABLE IF NOT EXISTS "fee_types" (
  "id" text PRIMARY KEY NOT NULL,
  "school_id" text NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "code" text NOT NULL,
  "name" text NOT NULL,
  "name_en" text,
  "category" text NOT NULL,
  "is_mandatory" boolean DEFAULT true,
  "is_recurring" boolean DEFAULT true,
  "revenue_account_id" text REFERENCES "accounts"("id") ON DELETE SET NULL,
  "receivable_account_id" text REFERENCES "accounts"("id") ON DELETE SET NULL,
  "display_order" smallint DEFAULT 0,
  "status" text DEFAULT 'active',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "fee_types_category_check" CHECK ("category" IN ('tuition', 'registration', 'exam', 'transport', 'uniform', 'books', 'meals', 'activities', 'other')),
  CONSTRAINT "fee_types_status_check" CHECK ("status" IN ('active', 'inactive')),
  CONSTRAINT "unique_school_fee_code" UNIQUE ("school_id", "code")
);

CREATE INDEX IF NOT EXISTS "idx_fee_types_school" ON "fee_types"("school_id");
CREATE INDEX IF NOT EXISTS "idx_fee_types_category" ON "fee_types"("category");
CREATE INDEX IF NOT EXISTS "idx_fee_types_status" ON "fee_types"("status");

-- ============================================
-- FEE STRUCTURES
-- ============================================

CREATE TABLE IF NOT EXISTS "fee_structures" (
  "id" text PRIMARY KEY NOT NULL,
  "school_id" text NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "school_year_id" text NOT NULL REFERENCES "school_years"("id") ON DELETE CASCADE,
  "fee_type_id" text NOT NULL REFERENCES "fee_types"("id") ON DELETE CASCADE,
  "grade_id" text REFERENCES "grades"("id") ON DELETE CASCADE,
  "series_id" text REFERENCES "series"("id") ON DELETE SET NULL,
  "amount" decimal(15, 2) NOT NULL,
  "currency" text DEFAULT 'XOF',
  "new_student_amount" decimal(15, 2),
  "effective_date" date,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "unique_fee_structure" UNIQUE ("school_id", "school_year_id", "fee_type_id", "grade_id", "series_id")
);

CREATE INDEX IF NOT EXISTS "idx_fee_structures_school_year" ON "fee_structures"("school_id", "school_year_id");
CREATE INDEX IF NOT EXISTS "idx_fee_structures_grade" ON "fee_structures"("grade_id");
CREATE INDEX IF NOT EXISTS "idx_fee_structures_fee_type" ON "fee_structures"("fee_type_id");
CREATE INDEX IF NOT EXISTS "idx_fee_structures_lookup" ON "fee_structures"("school_id", "school_year_id", "grade_id");

-- ============================================
-- DISCOUNTS
-- ============================================

CREATE TABLE IF NOT EXISTS "discounts" (
  "id" text PRIMARY KEY NOT NULL,
  "school_id" text NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "code" text NOT NULL,
  "name" text NOT NULL,
  "name_en" text,
  "type" text NOT NULL,
  "calculation_type" text NOT NULL,
  "value" decimal(10, 2) NOT NULL,
  "applies_to_fee_types" text[],
  "max_discount_amount" decimal(15, 2),
  "requires_approval" boolean DEFAULT false,
  "auto_apply" boolean DEFAULT false,
  "valid_from" date,
  "valid_until" date,
  "status" text DEFAULT 'active',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "discounts_type_check" CHECK ("type" IN ('sibling', 'scholarship', 'staff', 'early_payment', 'financial_aid', 'other')),
  CONSTRAINT "discounts_calculation_type_check" CHECK ("calculation_type" IN ('percentage', 'fixed')),
  CONSTRAINT "discounts_status_check" CHECK ("status" IN ('active', 'inactive')),
  CONSTRAINT "unique_school_discount_code" UNIQUE ("school_id", "code")
);

CREATE INDEX IF NOT EXISTS "idx_discounts_school" ON "discounts"("school_id");
CREATE INDEX IF NOT EXISTS "idx_discounts_type" ON "discounts"("type");
CREATE INDEX IF NOT EXISTS "idx_discounts_status" ON "discounts"("status");

-- ============================================
-- PAYMENT PLAN TEMPLATES
-- ============================================

CREATE TABLE IF NOT EXISTS "payment_plan_templates" (
  "id" text PRIMARY KEY NOT NULL,
  "school_id" text NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "school_year_id" text NOT NULL REFERENCES "school_years"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "name_en" text,
  "installments_count" smallint NOT NULL,
  "schedule" jsonb NOT NULL,
  "is_default" boolean DEFAULT false,
  "status" text DEFAULT 'active',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "payment_plan_templates_status_check" CHECK ("status" IN ('active', 'inactive'))
);

CREATE INDEX IF NOT EXISTS "idx_payment_plan_templates_school" ON "payment_plan_templates"("school_id");
CREATE INDEX IF NOT EXISTS "idx_payment_plan_templates_year" ON "payment_plan_templates"("school_year_id");
CREATE INDEX IF NOT EXISTS "idx_payment_plan_templates_default" ON "payment_plan_templates"("school_id", "is_default") WHERE "is_default" = true;


-- ============================================
-- PAYMENT PLANS (Student-specific)
-- ============================================

CREATE TABLE IF NOT EXISTS "payment_plans" (
  "id" text PRIMARY KEY NOT NULL,
  "student_id" text NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "school_year_id" text NOT NULL REFERENCES "school_years"("id") ON DELETE CASCADE,
  "template_id" text REFERENCES "payment_plan_templates"("id") ON DELETE SET NULL,
  "total_amount" decimal(15, 2) NOT NULL,
  "paid_amount" decimal(15, 2) DEFAULT '0',
  "balance" decimal(15, 2) NOT NULL,
  "status" text DEFAULT 'active',
  "notes" text,
  "created_by" text NOT NULL REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "payment_plans_status_check" CHECK ("status" IN ('active', 'completed', 'defaulted', 'cancelled')),
  CONSTRAINT "unique_student_payment_plan" UNIQUE ("student_id", "school_year_id")
);

CREATE INDEX IF NOT EXISTS "idx_payment_plans_student" ON "payment_plans"("student_id");
CREATE INDEX IF NOT EXISTS "idx_payment_plans_year" ON "payment_plans"("school_year_id");
CREATE INDEX IF NOT EXISTS "idx_payment_plans_status" ON "payment_plans"("status");
CREATE INDEX IF NOT EXISTS "idx_payment_plans_balance" ON "payment_plans"("school_year_id", "balance") WHERE "balance" > 0;

-- ============================================
-- INSTALLMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS "installments" (
  "id" text PRIMARY KEY NOT NULL,
  "payment_plan_id" text NOT NULL REFERENCES "payment_plans"("id") ON DELETE CASCADE,
  "installment_number" smallint NOT NULL,
  "label" text,
  "amount" decimal(15, 2) NOT NULL,
  "paid_amount" decimal(15, 2) DEFAULT '0',
  "balance" decimal(15, 2) NOT NULL,
  "due_date" date NOT NULL,
  "status" text DEFAULT 'pending',
  "paid_at" timestamp,
  "days_overdue" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "installments_status_check" CHECK ("status" IN ('pending', 'partial', 'paid', 'overdue', 'waived'))
);

CREATE INDEX IF NOT EXISTS "idx_installments_plan" ON "installments"("payment_plan_id");
CREATE INDEX IF NOT EXISTS "idx_installments_due_date" ON "installments"("due_date");
CREATE INDEX IF NOT EXISTS "idx_installments_status" ON "installments"("status");
CREATE INDEX IF NOT EXISTS "idx_installments_overdue" ON "installments"("status", "due_date") WHERE "status" = 'overdue';

-- ============================================
-- STUDENT FEES
-- ============================================

CREATE TABLE IF NOT EXISTS "student_fees" (
  "id" text PRIMARY KEY NOT NULL,
  "student_id" text NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "enrollment_id" text NOT NULL REFERENCES "enrollments"("id") ON DELETE CASCADE,
  "fee_structure_id" text NOT NULL REFERENCES "fee_structures"("id") ON DELETE RESTRICT,
  "original_amount" decimal(15, 2) NOT NULL,
  "discount_amount" decimal(15, 2) DEFAULT '0',
  "final_amount" decimal(15, 2) NOT NULL,
  "paid_amount" decimal(15, 2) DEFAULT '0',
  "balance" decimal(15, 2) NOT NULL,
  "status" text DEFAULT 'pending',
  "waived_at" timestamp,
  "waived_by" text REFERENCES "users"("id") ON DELETE SET NULL,
  "waiver_reason" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "student_fees_status_check" CHECK ("status" IN ('pending', 'partial', 'paid', 'waived', 'cancelled')),
  CONSTRAINT "unique_student_fee" UNIQUE ("student_id", "enrollment_id", "fee_structure_id")
);

CREATE INDEX IF NOT EXISTS "idx_student_fees_student" ON "student_fees"("student_id");
CREATE INDEX IF NOT EXISTS "idx_student_fees_enrollment" ON "student_fees"("enrollment_id");
CREATE INDEX IF NOT EXISTS "idx_student_fees_status" ON "student_fees"("status");
CREATE INDEX IF NOT EXISTS "idx_student_fees_balance" ON "student_fees"("student_id", "balance") WHERE "balance" > 0;

-- ============================================
-- STUDENT DISCOUNTS
-- ============================================

CREATE TABLE IF NOT EXISTS "student_discounts" (
  "id" text PRIMARY KEY NOT NULL,
  "student_id" text NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "discount_id" text NOT NULL REFERENCES "discounts"("id") ON DELETE RESTRICT,
  "school_year_id" text NOT NULL REFERENCES "school_years"("id") ON DELETE CASCADE,
  "calculated_amount" decimal(15, 2) NOT NULL,
  "status" text DEFAULT 'pending',
  "approved_by" text REFERENCES "users"("id") ON DELETE SET NULL,
  "approved_at" timestamp,
  "rejection_reason" text,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "student_discounts_status_check" CHECK ("status" IN ('pending', 'approved', 'rejected')),
  CONSTRAINT "unique_student_discount_year" UNIQUE ("student_id", "discount_id", "school_year_id")
);

CREATE INDEX IF NOT EXISTS "idx_student_discounts_student" ON "student_discounts"("student_id");
CREATE INDEX IF NOT EXISTS "idx_student_discounts_year" ON "student_discounts"("school_year_id");
CREATE INDEX IF NOT EXISTS "idx_student_discounts_status" ON "student_discounts"("status");


-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS "payments" (
  "id" text PRIMARY KEY NOT NULL,
  "school_id" text NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "student_id" text NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "payment_plan_id" text REFERENCES "payment_plans"("id") ON DELETE SET NULL,
  "receipt_number" text NOT NULL,
  "amount" decimal(15, 2) NOT NULL,
  "currency" text DEFAULT 'XOF',
  "method" text NOT NULL,
  "reference" text,
  "bank_name" text,
  "mobile_provider" text,
  "payment_date" date NOT NULL,
  "payer_name" text,
  "payer_phone" text,
  "notes" text,
  "status" text DEFAULT 'completed',
  "cancelled_at" timestamp,
  "cancelled_by" text REFERENCES "users"("id") ON DELETE SET NULL,
  "cancellation_reason" text,
  "processed_by" text NOT NULL REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "payments_method_check" CHECK ("method" IN ('cash', 'bank_transfer', 'mobile_money', 'card', 'check', 'other')),
  CONSTRAINT "payments_mobile_provider_check" CHECK ("mobile_provider" IS NULL OR "mobile_provider" IN ('orange', 'mtn', 'moov', 'wave', 'other')),
  CONSTRAINT "payments_status_check" CHECK ("status" IN ('pending', 'completed', 'cancelled', 'refunded', 'partial_refund')),
  CONSTRAINT "unique_receipt_number" UNIQUE ("school_id", "receipt_number")
);

CREATE INDEX IF NOT EXISTS "idx_payments_school" ON "payments"("school_id");
CREATE INDEX IF NOT EXISTS "idx_payments_student" ON "payments"("student_id");
CREATE INDEX IF NOT EXISTS "idx_payments_plan" ON "payments"("payment_plan_id");
CREATE INDEX IF NOT EXISTS "idx_payments_date" ON "payments"("school_id", "payment_date" DESC);
CREATE INDEX IF NOT EXISTS "idx_payments_method" ON "payments"("method");
CREATE INDEX IF NOT EXISTS "idx_payments_status" ON "payments"("status");
CREATE INDEX IF NOT EXISTS "idx_payments_receipt" ON "payments"("school_id", "receipt_number");
CREATE INDEX IF NOT EXISTS "idx_payments_processed_by" ON "payments"("processed_by", "payment_date");

-- ============================================
-- PAYMENT ALLOCATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS "payment_allocations" (
  "id" text PRIMARY KEY NOT NULL,
  "payment_id" text NOT NULL REFERENCES "payments"("id") ON DELETE CASCADE,
  "student_fee_id" text NOT NULL REFERENCES "student_fees"("id") ON DELETE RESTRICT,
  "installment_id" text REFERENCES "installments"("id") ON DELETE SET NULL,
  "amount" decimal(15, 2) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_payment_allocations_payment" ON "payment_allocations"("payment_id");
CREATE INDEX IF NOT EXISTS "idx_payment_allocations_fee" ON "payment_allocations"("student_fee_id");
CREATE INDEX IF NOT EXISTS "idx_payment_allocations_installment" ON "payment_allocations"("installment_id");

-- ============================================
-- TRANSACTIONS (Accounting)
-- ============================================

CREATE TABLE IF NOT EXISTS "transactions" (
  "id" text PRIMARY KEY NOT NULL,
  "school_id" text NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "fiscal_year_id" text NOT NULL REFERENCES "fiscal_years"("id") ON DELETE RESTRICT,
  "transaction_number" text NOT NULL,
  "date" date NOT NULL,
  "type" text NOT NULL,
  "description" text NOT NULL,
  "reference" text,
  "total_amount" decimal(15, 2) NOT NULL,
  "currency" text DEFAULT 'XOF',
  "student_id" text REFERENCES "students"("id") ON DELETE SET NULL,
  "payment_id" text REFERENCES "payments"("id") ON DELETE SET NULL,
  "status" text DEFAULT 'posted',
  "voided_at" timestamp,
  "voided_by" text REFERENCES "users"("id") ON DELETE SET NULL,
  "void_reason" text,
  "created_by" text NOT NULL REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "transactions_type_check" CHECK ("type" IN ('journal', 'payment', 'receipt', 'refund', 'adjustment', 'opening', 'closing')),
  CONSTRAINT "transactions_status_check" CHECK ("status" IN ('draft', 'posted', 'voided')),
  CONSTRAINT "unique_transaction_number" UNIQUE ("school_id", "transaction_number")
);

CREATE INDEX IF NOT EXISTS "idx_transactions_school" ON "transactions"("school_id");
CREATE INDEX IF NOT EXISTS "idx_transactions_fiscal_year" ON "transactions"("fiscal_year_id");
CREATE INDEX IF NOT EXISTS "idx_transactions_date" ON "transactions"("school_id", "date" DESC);
CREATE INDEX IF NOT EXISTS "idx_transactions_type" ON "transactions"("type");
CREATE INDEX IF NOT EXISTS "idx_transactions_student" ON "transactions"("student_id") WHERE "student_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_transactions_payment" ON "transactions"("payment_id") WHERE "payment_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_transactions_status" ON "transactions"("status");

-- ============================================
-- TRANSACTION LINES (Double-Entry)
-- ============================================

CREATE TABLE IF NOT EXISTS "transaction_lines" (
  "id" text PRIMARY KEY NOT NULL,
  "transaction_id" text NOT NULL REFERENCES "transactions"("id") ON DELETE CASCADE,
  "account_id" text NOT NULL REFERENCES "accounts"("id") ON DELETE RESTRICT,
  "line_number" smallint NOT NULL,
  "description" text,
  "debit_amount" decimal(15, 2) DEFAULT '0',
  "credit_amount" decimal(15, 2) DEFAULT '0',
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "check_debit_or_credit" CHECK (
    ("debit_amount" > 0 AND "credit_amount" = 0) OR 
    ("credit_amount" > 0 AND "debit_amount" = 0)
  )
);

CREATE INDEX IF NOT EXISTS "idx_transaction_lines_transaction" ON "transaction_lines"("transaction_id");
CREATE INDEX IF NOT EXISTS "idx_transaction_lines_account" ON "transaction_lines"("account_id");
CREATE INDEX IF NOT EXISTS "idx_transaction_lines_amounts" ON "transaction_lines"("account_id", "debit_amount", "credit_amount");

-- ============================================
-- RECEIPTS
-- ============================================

CREATE TABLE IF NOT EXISTS "receipts" (
  "id" text PRIMARY KEY NOT NULL,
  "payment_id" text NOT NULL REFERENCES "payments"("id") ON DELETE CASCADE,
  "receipt_number" text NOT NULL,
  "student_name" text NOT NULL,
  "student_matricule" text NOT NULL,
  "class_name" text NOT NULL,
  "amount" decimal(15, 2) NOT NULL,
  "amount_in_words" text,
  "payment_method" text NOT NULL,
  "payment_reference" text,
  "payment_date" date NOT NULL,
  "fee_details" jsonb NOT NULL,
  "school_name" text NOT NULL,
  "school_address" text,
  "school_phone" text,
  "school_logo_url" text,
  "issued_by" text NOT NULL,
  "issued_at" timestamp DEFAULT now() NOT NULL,
  "reprint_count" integer DEFAULT 0,
  "last_reprinted_at" timestamp,
  "last_reprinted_by" text REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_receipts_payment" ON "receipts"("payment_id");
CREATE INDEX IF NOT EXISTS "idx_receipts_number" ON "receipts"("receipt_number");
CREATE INDEX IF NOT EXISTS "idx_receipts_date" ON "receipts"("payment_date" DESC);

-- ============================================
-- REFUNDS
-- ============================================

CREATE TABLE IF NOT EXISTS "refunds" (
  "id" text PRIMARY KEY NOT NULL,
  "payment_id" text NOT NULL REFERENCES "payments"("id") ON DELETE RESTRICT,
  "school_id" text NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "refund_number" text NOT NULL,
  "amount" decimal(15, 2) NOT NULL,
  "reason" text NOT NULL,
  "reason_category" text,
  "method" text NOT NULL,
  "reference" text,
  "status" text DEFAULT 'pending',
  "requested_by" text NOT NULL REFERENCES "users"("id"),
  "requested_at" timestamp DEFAULT now() NOT NULL,
  "approved_by" text REFERENCES "users"("id") ON DELETE SET NULL,
  "approved_at" timestamp,
  "rejection_reason" text,
  "processed_by" text REFERENCES "users"("id") ON DELETE SET NULL,
  "processed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "refunds_reason_category_check" CHECK ("reason_category" IS NULL OR "reason_category" IN ('overpayment', 'withdrawal', 'transfer', 'error', 'other')),
  CONSTRAINT "refunds_method_check" CHECK ("method" IN ('cash', 'bank_transfer', 'mobile_money', 'check', 'credit')),
  CONSTRAINT "refunds_status_check" CHECK ("status" IN ('pending', 'approved', 'rejected', 'processed', 'cancelled')),
  CONSTRAINT "unique_refund_number" UNIQUE ("school_id", "refund_number")
);

CREATE INDEX IF NOT EXISTS "idx_refunds_payment" ON "refunds"("payment_id");
CREATE INDEX IF NOT EXISTS "idx_refunds_school" ON "refunds"("school_id");
CREATE INDEX IF NOT EXISTS "idx_refunds_status" ON "refunds"("status");
CREATE INDEX IF NOT EXISTS "idx_refunds_date" ON "refunds"("school_id", "requested_at" DESC);
