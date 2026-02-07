CREATE TABLE "auth_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "auth_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "auth_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "auth_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"school_id" text,
	"action" text NOT NULL,
	"resource" text,
	"resource_id" text,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"endpoint" text NOT NULL,
	"method" text NOT NULL,
	"status_code" smallint NOT NULL,
	"response_time_ms" integer NOT NULL,
	"user_id" text,
	"school_id" text,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coefficient_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"weight" smallint NOT NULL,
	"school_year_template_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"grade_id" text NOT NULL,
	"series_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "education_levels" (
	"id" smallint PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"order" smallint NOT NULL,
	CONSTRAINT "education_levels_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "fee_type_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"name_en" text,
	"category" text NOT NULL,
	"description" text,
	"default_amount" integer,
	"is_mandatory" boolean DEFAULT false NOT NULL,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grades" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"order" smallint NOT NULL,
	"track_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_template_chapters" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"objectives" text,
	"order" smallint NOT NULL,
	"duration_hours" integer,
	"program_template_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_template_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"program_template_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"snapshot_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"school_year_template_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"grade_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_year_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"address" text,
	"phone" text,
	"email" text,
	"logo_url" text,
	"status" text DEFAULT 'active' NOT NULL,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "schools_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"track_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "series_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"category" text DEFAULT 'Autre' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "term_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"order" smallint NOT NULL,
	"school_year_template_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"education_level_id" smallint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tracks_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"name_en" text,
	"type" text NOT NULL,
	"parent_id" text,
	"level" smallint DEFAULT 1 NOT NULL,
	"is_header" boolean DEFAULT false,
	"balance" numeric(15, 2) DEFAULT '0',
	"normal_balance" text NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_school_account_code" UNIQUE("school_id","code")
);
--> statement-breakpoint
CREATE TABLE "attendance_alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"alert_type" text NOT NULL,
	"teacher_id" text,
	"student_id" text,
	"class_id" text,
	"severity" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"data" jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"acknowledged_by" text,
	"acknowledged_at" timestamp,
	"resolved_at" timestamp,
	"notified_users" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "attendance_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"teacher_expected_arrival" text DEFAULT '07:30',
	"teacher_late_threshold_minutes" integer DEFAULT 15,
	"teacher_lateness_alert_count" integer DEFAULT 3,
	"student_late_threshold_minutes" integer DEFAULT 10,
	"chronic_absence_threshold_percent" numeric(5, 2) DEFAULT '10.00',
	"notify_parent_on_absence" boolean DEFAULT true,
	"notify_parent_on_late" boolean DEFAULT false,
	"working_days" smallint[] DEFAULT '{1,2,3,4,5}',
	"notification_methods" text[] DEFAULT '{"email"}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_attendance_settings_school" UNIQUE("school_id")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"table_name" text NOT NULL,
	"record_id" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chapter_completions" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"chapter_id" text NOT NULL,
	"class_session_id" text,
	"teacher_id" text NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	CONSTRAINT "unique_class_chapter" UNIQUE("class_id","chapter_id")
);
--> statement-breakpoint
CREATE TABLE "class_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"chapter_id" text,
	"timetable_session_id" text,
	"date" date NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"topic" text,
	"objectives" text,
	"homework" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"completed_at" timestamp,
	"students_present" integer,
	"students_absent" integer,
	"notes" text,
	"attachments" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_subjects" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"teacher_id" text,
	"coefficient" integer DEFAULT 1 NOT NULL,
	"hours_per_week" integer DEFAULT 2 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_class_subject" UNIQUE("class_id","subject_id")
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"school_year_id" text NOT NULL,
	"grade_id" text NOT NULL,
	"series_id" text,
	"section" text NOT NULL,
	"classroom_id" text,
	"homeroom_teacher_id" text,
	"max_students" integer DEFAULT 40 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classrooms" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"type" text DEFAULT 'regular' NOT NULL,
	"capacity" integer DEFAULT 30 NOT NULL,
	"floor" text,
	"building" text,
	"equipment" jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_school_code" UNIQUE("school_id","code")
);
--> statement-breakpoint
CREATE TABLE "conduct_follow_ups" (
	"id" text PRIMARY KEY NOT NULL,
	"conduct_record_id" text NOT NULL,
	"action" text NOT NULL,
	"notes" text,
	"outcome" text,
	"follow_up_date" date,
	"completed_at" timestamp,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conduct_records" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"school_id" text NOT NULL,
	"class_id" text,
	"school_year_id" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"severity" text,
	"incident_date" date,
	"incident_time" text,
	"location" text,
	"witnesses" text[],
	"sanction_type" text,
	"sanction_start_date" date,
	"sanction_end_date" date,
	"sanction_details" text,
	"reward_type" text,
	"points_awarded" integer,
	"status" text DEFAULT 'open' NOT NULL,
	"assigned_to" text,
	"parent_notified" boolean DEFAULT false,
	"parent_notified_at" timestamp,
	"parent_acknowledged" boolean DEFAULT false,
	"parent_acknowledged_at" timestamp,
	"parent_response" text,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"recorded_by" text NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp,
	"resolution_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculum_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"program_template_id" text NOT NULL,
	"term_id" text NOT NULL,
	"total_chapters" integer DEFAULT 0 NOT NULL,
	"completed_chapters" integer DEFAULT 0 NOT NULL,
	"progress_percentage" numeric(5, 2) DEFAULT '0' NOT NULL,
	"expected_percentage" numeric(5, 2),
	"variance" numeric(5, 2),
	"status" text DEFAULT 'on_track' NOT NULL,
	"last_chapter_completed_at" timestamp,
	"calculated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_class_subject_term" UNIQUE("class_id","subject_id","term_id")
);
--> statement-breakpoint
CREATE TABLE "discounts" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"name_en" text,
	"type" text NOT NULL,
	"calculation_type" text NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"applies_to_fee_types" text[],
	"max_discount_amount" numeric(15, 2),
	"requires_approval" boolean DEFAULT false,
	"auto_apply" boolean DEFAULT false,
	"valid_from" date,
	"valid_until" date,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_school_discount_code" UNIQUE("school_id","code")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"class_id" text NOT NULL,
	"school_year_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"enrollment_date" date NOT NULL,
	"confirmed_at" timestamp,
	"confirmed_by" text,
	"cancelled_at" timestamp,
	"cancelled_by" text,
	"cancellation_reason" text,
	"transferred_at" timestamp,
	"transferred_to" text,
	"transfer_reason" text,
	"previous_enrollment_id" text,
	"roll_number" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fee_structures" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"school_year_id" text NOT NULL,
	"fee_type_id" text NOT NULL,
	"grade_id" text,
	"series_id" text,
	"amount" numeric(15, 2) NOT NULL,
	"currency" text DEFAULT 'XOF',
	"new_student_amount" numeric(15, 2),
	"effective_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_fee_structure" UNIQUE NULLS NOT DISTINCT("school_id","school_year_id","fee_type_id","grade_id","series_id")
);
--> statement-breakpoint
CREATE TABLE "fee_types" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"fee_type_template_id" text,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"name_en" text,
	"category" text NOT NULL,
	"is_mandatory" boolean DEFAULT true,
	"is_recurring" boolean DEFAULT true,
	"revenue_account_id" text,
	"receivable_account_id" text,
	"display_order" smallint DEFAULT 0,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_school_fee_code" UNIQUE("school_id","code"),
	CONSTRAINT "unique_school_fee_template" UNIQUE NULLS NOT DISTINCT("school_id","fee_type_template_id")
);
--> statement-breakpoint
CREATE TABLE "fiscal_years" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"school_year_id" text NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" text DEFAULT 'open',
	"closed_at" timestamp,
	"closed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_school_fiscal_year" UNIQUE("school_id","school_year_id")
);
--> statement-breakpoint
CREATE TABLE "grade_validations" (
	"id" text PRIMARY KEY NOT NULL,
	"grade_id" text NOT NULL,
	"validator_id" text NOT NULL,
	"action" text NOT NULL,
	"previous_value" numeric(5, 2),
	"new_value" numeric(5, 2),
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homework" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"class_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"class_session_id" text,
	"title" text NOT NULL,
	"description" text,
	"instructions" text,
	"due_date" date NOT NULL,
	"due_time" text,
	"max_points" smallint,
	"is_graded" boolean DEFAULT false,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homework_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"homework_id" text NOT NULL,
	"student_id" text NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"content" text,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"grade" numeric(5, 2),
	"graded_at" timestamp,
	"graded_by" text,
	"feedback" text,
	"status" text DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_homework_student" UNIQUE("homework_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "installments" (
	"id" text PRIMARY KEY NOT NULL,
	"payment_plan_id" text NOT NULL,
	"installment_number" smallint NOT NULL,
	"label" text,
	"amount" numeric(15, 2) NOT NULL,
	"paid_amount" numeric(15, 2) DEFAULT '0',
	"balance" numeric(15, 2) NOT NULL,
	"due_date" date NOT NULL,
	"status" text DEFAULT 'pending',
	"paid_at" timestamp,
	"days_overdue" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matricule_sequences" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"school_year_id" text NOT NULL,
	"prefix" text NOT NULL,
	"last_number" integer DEFAULT 0 NOT NULL,
	"format" text DEFAULT '{prefix}{year}{sequence:4}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_matricule_seq_school_year" UNIQUE("school_id","school_year_id")
);
--> statement-breakpoint
CREATE TABLE "message_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"name" text NOT NULL,
	"name_en" text,
	"category" text NOT NULL,
	"subject" text,
	"content" text NOT NULL,
	"placeholders" jsonb DEFAULT '[]'::jsonb,
	"is_system" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parents" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text NOT NULL,
	"phone_2" text,
	"address" text,
	"occupation" text,
	"workplace" text,
	"invitation_status" text DEFAULT 'pending',
	"invitation_sent_at" timestamp,
	"invitation_token" text,
	"invitation_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participation_grades" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"class_session_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"grade" smallint NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_student_session_participation" UNIQUE("student_id","class_session_id")
);
--> statement-breakpoint
CREATE TABLE "payment_allocations" (
	"id" text PRIMARY KEY NOT NULL,
	"payment_id" text NOT NULL,
	"student_fee_id" text NOT NULL,
	"installment_id" text,
	"amount" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_plan_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"school_year_id" text NOT NULL,
	"name" text NOT NULL,
	"name_en" text,
	"installments_count" smallint NOT NULL,
	"schedule" jsonb NOT NULL,
	"is_default" boolean DEFAULT false,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"school_year_id" text NOT NULL,
	"template_id" text,
	"total_amount" numeric(15, 2) NOT NULL,
	"paid_amount" numeric(15, 2) DEFAULT '0',
	"balance" numeric(15, 2) NOT NULL,
	"status" text DEFAULT 'active',
	"notes" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_student_payment_plan" UNIQUE("student_id","school_year_id")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"student_id" text NOT NULL,
	"payment_plan_id" text,
	"receipt_number" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
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
	"cancelled_by" text,
	"cancellation_reason" text,
	"processed_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_receipt_number" UNIQUE("school_id","receipt_number")
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" text PRIMARY KEY NOT NULL,
	"payment_id" text NOT NULL,
	"receipt_number" text NOT NULL,
	"student_name" text NOT NULL,
	"student_matricule" text NOT NULL,
	"class_name" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
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
	"last_reprinted_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" text PRIMARY KEY NOT NULL,
	"payment_id" text NOT NULL,
	"school_id" text NOT NULL,
	"refund_number" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"reason" text NOT NULL,
	"reason_category" text,
	"method" text NOT NULL,
	"reference" text,
	"status" text DEFAULT 'pending',
	"requested_by" text NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"approved_by" text,
	"approved_at" timestamp,
	"rejection_reason" text,
	"processed_by" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_refund_number" UNIQUE("school_id","refund_number")
);
--> statement-breakpoint
CREATE TABLE "report_card_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"name" text NOT NULL,
	"is_default" boolean DEFAULT false,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"primary_color" text DEFAULT '#1e40af',
	"font_family" text DEFAULT 'DM Sans',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_cards" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"class_id" text NOT NULL,
	"term_id" text NOT NULL,
	"school_year_id" text NOT NULL,
	"template_id" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"generated_at" timestamp,
	"generated_by" text,
	"pdf_url" text,
	"pdf_size" integer,
	"sent_at" timestamp,
	"sent_to" text,
	"delivery_method" text,
	"delivered_at" timestamp,
	"viewed_at" timestamp,
	"bounce_reason" text,
	"homeroom_comment" text,
	"conduct_summary" text,
	"attendance_summary" jsonb,
	"template_version" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_student_term" UNIQUE("student_id","term_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"permissions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"scope" text NOT NULL,
	"is_system_role" boolean DEFAULT false NOT NULL,
	"extra_languages" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "school_files" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"key" text NOT NULL,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer,
	"entity_type" text,
	"entity_id" text,
	"uploaded_by" text,
	"deleted_by" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "school_files_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "school_subject_coefficients" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"coefficient_template_id" text NOT NULL,
	"weight_override" smallint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_school_template" UNIQUE("school_id","coefficient_template_id")
);
--> statement-breakpoint
CREATE TABLE "school_subjects" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"school_year_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_school_subject_year" UNIQUE("school_id","subject_id","school_year_id")
);
--> statement-breakpoint
CREATE TABLE "school_years" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"school_year_template_id" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"school_id" text NOT NULL,
	"position" text NOT NULL,
	"department" text,
	"hire_date" date,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"class_id" text NOT NULL,
	"school_id" text NOT NULL,
	"class_session_id" text,
	"date" date NOT NULL,
	"status" text DEFAULT 'present' NOT NULL,
	"arrival_time" text,
	"late_minutes" integer,
	"reason" text,
	"reason_category" text,
	"excused_by" text,
	"excused_at" timestamp,
	"parent_notified" boolean DEFAULT false,
	"notified_at" timestamp,
	"notification_method" text,
	"notes" text,
	"recorded_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_student_attendance" UNIQUE NULLS NOT DISTINCT("student_id","date","class_id","class_session_id")
);
--> statement-breakpoint
CREATE TABLE "student_averages" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"term_id" text NOT NULL,
	"subject_id" text,
	"class_id" text NOT NULL,
	"average" numeric(5, 2) NOT NULL,
	"weighted_average" numeric(5, 2),
	"grade_count" integer DEFAULT 0 NOT NULL,
	"rank_in_class" smallint,
	"rank_in_grade" smallint,
	"calculated_at" timestamp DEFAULT now() NOT NULL,
	"is_final" boolean DEFAULT false NOT NULL,
	CONSTRAINT "unique_student_term_subject" UNIQUE("student_id","term_id","subject_id")
);
--> statement-breakpoint
CREATE TABLE "student_discounts" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"discount_id" text NOT NULL,
	"school_year_id" text NOT NULL,
	"calculated_amount" numeric(15, 2) NOT NULL,
	"status" text DEFAULT 'pending',
	"approved_by" text,
	"approved_at" timestamp,
	"rejection_reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_student_discount_year" UNIQUE("student_id","discount_id","school_year_id")
);
--> statement-breakpoint
CREATE TABLE "student_fees" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"enrollment_id" text NOT NULL,
	"fee_structure_id" text NOT NULL,
	"original_amount" numeric(15, 2) NOT NULL,
	"discount_amount" numeric(15, 2) DEFAULT '0',
	"final_amount" numeric(15, 2) NOT NULL,
	"paid_amount" numeric(15, 2) DEFAULT '0',
	"balance" numeric(15, 2) NOT NULL,
	"status" text DEFAULT 'pending',
	"waived_at" timestamp,
	"waived_by" text,
	"waiver_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_student_fee" UNIQUE("student_id","enrollment_id","fee_structure_id")
);
--> statement-breakpoint
CREATE TABLE "student_grades" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"class_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"term_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"value" numeric(5, 2) NOT NULL,
	"type" text NOT NULL,
	"weight" smallint DEFAULT 1 NOT NULL,
	"description" text,
	"grade_date" date DEFAULT now() NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp,
	"validated_at" timestamp,
	"validated_by" text,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_parents" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"parent_id" text NOT NULL,
	"relationship" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"can_pickup" boolean DEFAULT true NOT NULL,
	"receive_notifications" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_student_parent" UNIQUE("student_id","parent_id")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"dob" date NOT NULL,
	"gender" text,
	"photo_url" text,
	"matricule" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"birth_place" text,
	"nationality" text DEFAULT 'Ivoirien',
	"address" text,
	"emergency_contact" text,
	"emergency_phone" text,
	"blood_type" text,
	"medical_notes" text,
	"previous_school" text,
	"admission_date" date,
	"graduation_date" date,
	"transfer_date" date,
	"transfer_reason" text,
	"withdrawal_date" date,
	"withdrawal_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_school_matricule" UNIQUE("school_id","matricule")
);
--> statement-breakpoint
CREATE TABLE "teacher_attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"teacher_id" text NOT NULL,
	"school_id" text NOT NULL,
	"date" date NOT NULL,
	"status" text DEFAULT 'present' NOT NULL,
	"arrival_time" text,
	"departure_time" text,
	"late_minutes" integer,
	"reason" text,
	"notes" text,
	"recorded_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_teacher_date" UNIQUE("teacher_id","date")
);
--> statement-breakpoint
CREATE TABLE "teacher_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"report_card_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_report_subject" UNIQUE("report_card_id","subject_id")
);
--> statement-breakpoint
CREATE TABLE "teacher_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"sender_type" text NOT NULL,
	"sender_id" text NOT NULL,
	"recipient_type" text NOT NULL,
	"recipient_id" text NOT NULL,
	"student_id" text,
	"class_id" text,
	"thread_id" text,
	"reply_to_id" text,
	"subject" text,
	"content" text NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"is_archived" boolean DEFAULT false,
	"is_starred" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"teacher_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"action_type" text,
	"action_data" jsonb,
	"related_type" text,
	"related_id" text,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "teacher_subjects" (
	"id" text PRIMARY KEY NOT NULL,
	"teacher_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_teacher_subject" UNIQUE("teacher_id","subject_id")
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"school_id" text NOT NULL,
	"specialization" text,
	"hire_date" date,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "terms" (
	"id" text PRIMARY KEY NOT NULL,
	"school_year_id" text NOT NULL,
	"term_template_id" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timetable_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"school_year_id" text NOT NULL,
	"class_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"classroom_id" text,
	"day_of_week" smallint NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"effective_from" date,
	"effective_until" date,
	"is_recurring" boolean DEFAULT true,
	"notes" text,
	"color" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_lines" (
	"id" text PRIMARY KEY NOT NULL,
	"transaction_id" text NOT NULL,
	"account_id" text NOT NULL,
	"line_number" smallint NOT NULL,
	"description" text,
	"debit_amount" numeric(15, 2) DEFAULT '0',
	"credit_amount" numeric(15, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"fiscal_year_id" text NOT NULL,
	"transaction_number" text NOT NULL,
	"date" date NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"reference" text,
	"total_amount" numeric(15, 2) NOT NULL,
	"currency" text DEFAULT 'XOF',
	"student_id" text,
	"payment_id" text,
	"status" text DEFAULT 'posted',
	"voided_at" timestamp,
	"voided_by" text,
	"void_reason" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_transaction_number" UNIQUE("school_id","transaction_number")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role_id" text NOT NULL,
	"school_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_role_school" UNIQUE("user_id","role_id","school_id")
);
--> statement-breakpoint
CREATE TABLE "user_schools" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"school_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_school" UNIQUE("user_id","school_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"auth_user_id" text,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"avatar_url" text,
	"status" text DEFAULT 'active' NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_auth_user_id_unique" UNIQUE("auth_user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "crm_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"contact_id" text NOT NULL,
	"school_id" text,
	"user_id" text,
	"type" text NOT NULL,
	"subject" text,
	"description" text,
	"outcome" text,
	"next_follow_up" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text,
	"contact_name" text NOT NULL,
	"email" text,
	"phone" text,
	"role" text,
	"notes" text,
	"last_contacted_at" timestamp,
	"next_follow_up" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"contact_id" text,
	"school_id" text,
	"user_id" text,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"due_date" timestamp,
	"priority" text DEFAULT 'medium' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "knowledge_base_articles" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"category" text NOT NULL,
	"tags" jsonb,
	"views" integer DEFAULT 0,
	"helpful_count" integer DEFAULT 0,
	"not_helpful_count" integer DEFAULT 0,
	"is_published" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"author_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text,
	"user_id" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"assignee_id" text,
	"resolution" text,
	"satisfaction_rating" smallint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ticket_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"user_id" text,
	"message" text NOT NULL,
	"is_internal" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_account" ADD CONSTRAINT "auth_account_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_metrics" ADD CONSTRAINT "api_metrics_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_metrics" ADD CONSTRAINT "api_metrics_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coefficient_templates" ADD CONSTRAINT "coefficient_templates_school_year_template_id_school_year_templates_id_fk" FOREIGN KEY ("school_year_template_id") REFERENCES "public"."school_year_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coefficient_templates" ADD CONSTRAINT "coefficient_templates_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coefficient_templates" ADD CONSTRAINT "coefficient_templates_grade_id_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coefficient_templates" ADD CONSTRAINT "coefficient_templates_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_template_chapters" ADD CONSTRAINT "program_template_chapters_program_template_id_program_templates_id_fk" FOREIGN KEY ("program_template_id") REFERENCES "public"."program_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_template_versions" ADD CONSTRAINT "program_template_versions_program_template_id_program_templates_id_fk" FOREIGN KEY ("program_template_id") REFERENCES "public"."program_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_templates" ADD CONSTRAINT "program_templates_school_year_template_id_school_year_templates_id_fk" FOREIGN KEY ("school_year_template_id") REFERENCES "public"."school_year_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_templates" ADD CONSTRAINT "program_templates_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_templates" ADD CONSTRAINT "program_templates_grade_id_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "term_templates" ADD CONSTRAINT "term_templates_school_year_template_id_school_year_templates_id_fk" FOREIGN KEY ("school_year_template_id") REFERENCES "public"."school_year_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_education_level_id_education_levels_id_fk" FOREIGN KEY ("education_level_id") REFERENCES "public"."education_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_alerts" ADD CONSTRAINT "attendance_alerts_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_alerts" ADD CONSTRAINT "attendance_alerts_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_alerts" ADD CONSTRAINT "attendance_alerts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_alerts" ADD CONSTRAINT "attendance_alerts_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_alerts" ADD CONSTRAINT "attendance_alerts_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_settings" ADD CONSTRAINT "attendance_settings_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapter_completions" ADD CONSTRAINT "chapter_completions_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapter_completions" ADD CONSTRAINT "chapter_completions_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapter_completions" ADD CONSTRAINT "chapter_completions_chapter_id_program_template_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."program_template_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapter_completions" ADD CONSTRAINT "chapter_completions_class_session_id_class_sessions_id_fk" FOREIGN KEY ("class_session_id") REFERENCES "public"."class_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapter_completions" ADD CONSTRAINT "chapter_completions_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_chapter_id_program_template_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."program_template_chapters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_timetable_session_id_timetable_sessions_id_fk" FOREIGN KEY ("timetable_session_id") REFERENCES "public"."timetable_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_grade_id_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_homeroom_teacher_id_teachers_id_fk" FOREIGN KEY ("homeroom_teacher_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conduct_follow_ups" ADD CONSTRAINT "conduct_follow_ups_conduct_record_id_conduct_records_id_fk" FOREIGN KEY ("conduct_record_id") REFERENCES "public"."conduct_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conduct_follow_ups" ADD CONSTRAINT "conduct_follow_ups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conduct_records" ADD CONSTRAINT "conduct_records_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conduct_records" ADD CONSTRAINT "conduct_records_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conduct_records" ADD CONSTRAINT "conduct_records_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conduct_records" ADD CONSTRAINT "conduct_records_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conduct_records" ADD CONSTRAINT "conduct_records_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conduct_records" ADD CONSTRAINT "conduct_records_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conduct_records" ADD CONSTRAINT "conduct_records_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_progress" ADD CONSTRAINT "curriculum_progress_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_progress" ADD CONSTRAINT "curriculum_progress_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_progress" ADD CONSTRAINT "curriculum_progress_program_template_id_program_templates_id_fk" FOREIGN KEY ("program_template_id") REFERENCES "public"."program_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_progress" ADD CONSTRAINT "curriculum_progress_term_id_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_confirmed_by_users_id_fk" FOREIGN KEY ("confirmed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_cancelled_by_users_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_transferred_to_classes_id_fk" FOREIGN KEY ("transferred_to") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_fee_type_id_fee_types_id_fk" FOREIGN KEY ("fee_type_id") REFERENCES "public"."fee_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_grade_id_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_types" ADD CONSTRAINT "fee_types_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_types" ADD CONSTRAINT "fee_types_fee_type_template_id_fee_type_templates_id_fk" FOREIGN KEY ("fee_type_template_id") REFERENCES "public"."fee_type_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_types" ADD CONSTRAINT "fee_types_revenue_account_id_accounts_id_fk" FOREIGN KEY ("revenue_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_types" ADD CONSTRAINT "fee_types_receivable_account_id_accounts_id_fk" FOREIGN KEY ("receivable_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiscal_years" ADD CONSTRAINT "fiscal_years_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiscal_years" ADD CONSTRAINT "fiscal_years_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiscal_years" ADD CONSTRAINT "fiscal_years_closed_by_users_id_fk" FOREIGN KEY ("closed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade_validations" ADD CONSTRAINT "grade_validations_grade_id_student_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."student_grades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade_validations" ADD CONSTRAINT "grade_validations_validator_id_users_id_fk" FOREIGN KEY ("validator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework" ADD CONSTRAINT "homework_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework" ADD CONSTRAINT "homework_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework" ADD CONSTRAINT "homework_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework" ADD CONSTRAINT "homework_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework" ADD CONSTRAINT "homework_class_session_id_class_sessions_id_fk" FOREIGN KEY ("class_session_id") REFERENCES "public"."class_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_homework_id_homework_id_fk" FOREIGN KEY ("homework_id") REFERENCES "public"."homework"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_graded_by_teachers_id_fk" FOREIGN KEY ("graded_by") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installments" ADD CONSTRAINT "installments_payment_plan_id_payment_plans_id_fk" FOREIGN KEY ("payment_plan_id") REFERENCES "public"."payment_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matricule_sequences" ADD CONSTRAINT "matricule_sequences_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matricule_sequences" ADD CONSTRAINT "matricule_sequences_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parents" ADD CONSTRAINT "parents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participation_grades" ADD CONSTRAINT "participation_grades_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participation_grades" ADD CONSTRAINT "participation_grades_class_session_id_class_sessions_id_fk" FOREIGN KEY ("class_session_id") REFERENCES "public"."class_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participation_grades" ADD CONSTRAINT "participation_grades_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_student_fee_id_student_fees_id_fk" FOREIGN KEY ("student_fee_id") REFERENCES "public"."student_fees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_installment_id_installments_id_fk" FOREIGN KEY ("installment_id") REFERENCES "public"."installments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_templates" ADD CONSTRAINT "payment_plan_templates_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_templates" ADD CONSTRAINT "payment_plan_templates_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_template_id_payment_plan_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."payment_plan_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_plan_id_payment_plans_id_fk" FOREIGN KEY ("payment_plan_id") REFERENCES "public"."payment_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_cancelled_by_users_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_last_reprinted_by_users_id_fk" FOREIGN KEY ("last_reprinted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_card_templates" ADD CONSTRAINT "report_card_templates_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_term_id_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_template_id_report_card_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."report_card_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_files" ADD CONSTRAINT "school_files_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_files" ADD CONSTRAINT "school_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_files" ADD CONSTRAINT "school_files_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_subject_coefficients" ADD CONSTRAINT "school_subject_coefficients_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_subject_coefficients" ADD CONSTRAINT "school_subject_coefficients_coefficient_template_id_coefficient_templates_id_fk" FOREIGN KEY ("coefficient_template_id") REFERENCES "public"."coefficient_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_subjects" ADD CONSTRAINT "school_subjects_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_subjects" ADD CONSTRAINT "school_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_subjects" ADD CONSTRAINT "school_subjects_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_years" ADD CONSTRAINT "school_years_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_years" ADD CONSTRAINT "school_years_school_year_template_id_school_year_templates_id_fk" FOREIGN KEY ("school_year_template_id") REFERENCES "public"."school_year_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_class_session_id_class_sessions_id_fk" FOREIGN KEY ("class_session_id") REFERENCES "public"."class_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_excused_by_users_id_fk" FOREIGN KEY ("excused_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_averages" ADD CONSTRAINT "student_averages_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_averages" ADD CONSTRAINT "student_averages_term_id_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_averages" ADD CONSTRAINT "student_averages_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_averages" ADD CONSTRAINT "student_averages_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_discounts" ADD CONSTRAINT "student_discounts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_discounts" ADD CONSTRAINT "student_discounts_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_discounts" ADD CONSTRAINT "student_discounts_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_discounts" ADD CONSTRAINT "student_discounts_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_fee_structure_id_fee_structures_id_fk" FOREIGN KEY ("fee_structure_id") REFERENCES "public"."fee_structures"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_waived_by_users_id_fk" FOREIGN KEY ("waived_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_grades" ADD CONSTRAINT "student_grades_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_grades" ADD CONSTRAINT "student_grades_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_grades" ADD CONSTRAINT "student_grades_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_grades" ADD CONSTRAINT "student_grades_term_id_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_grades" ADD CONSTRAINT "student_grades_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_grades" ADD CONSTRAINT "student_grades_validated_by_users_id_fk" FOREIGN KEY ("validated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_parents" ADD CONSTRAINT "student_parents_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_parents" ADD CONSTRAINT "student_parents_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_attendance" ADD CONSTRAINT "teacher_attendance_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_attendance" ADD CONSTRAINT "teacher_attendance_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_attendance" ADD CONSTRAINT "teacher_attendance_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_comments" ADD CONSTRAINT "teacher_comments_report_card_id_report_cards_id_fk" FOREIGN KEY ("report_card_id") REFERENCES "public"."report_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_comments" ADD CONSTRAINT "teacher_comments_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_comments" ADD CONSTRAINT "teacher_comments_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_messages" ADD CONSTRAINT "teacher_messages_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_messages" ADD CONSTRAINT "teacher_messages_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_messages" ADD CONSTRAINT "teacher_messages_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_notifications" ADD CONSTRAINT "teacher_notifications_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "terms" ADD CONSTRAINT "terms_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "terms" ADD CONSTRAINT "terms_term_template_id_term_templates_id_fk" FOREIGN KEY ("term_template_id") REFERENCES "public"."term_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_sessions" ADD CONSTRAINT "timetable_sessions_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_sessions" ADD CONSTRAINT "timetable_sessions_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_sessions" ADD CONSTRAINT "timetable_sessions_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_sessions" ADD CONSTRAINT "timetable_sessions_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_sessions" ADD CONSTRAINT "timetable_sessions_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_sessions" ADD CONSTRAINT "timetable_sessions_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_lines" ADD CONSTRAINT "transaction_lines_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_lines" ADD CONSTRAINT "transaction_lines_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_fiscal_year_id_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."fiscal_years"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_voided_by_users_id_fk" FOREIGN KEY ("voided_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_schools" ADD CONSTRAINT "user_schools_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_schools" ADD CONSTRAINT "user_schools_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_auth_user_id_auth_user_id_fk" FOREIGN KEY ("auth_user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_contact_id_crm_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."crm_contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contacts" ADD CONSTRAINT "crm_contacts_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_contact_id_crm_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."crm_contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_base_articles" ADD CONSTRAINT "knowledge_base_articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_account_userId_idx" ON "auth_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_session_userId_idx" ON "auth_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_verification_identifier_idx" ON "auth_verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "idx_activity_user_time" ON "activity_logs" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_activity_school_time" ON "activity_logs" USING btree ("school_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_activity_action_time" ON "activity_logs" USING btree ("action","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_activity_resource" ON "activity_logs" USING btree ("resource","resource_id");--> statement-breakpoint
CREATE INDEX "idx_api_endpoint_time" ON "api_metrics" USING btree ("endpoint","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_api_status_time" ON "api_metrics" USING btree ("status_code","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_api_user_time" ON "api_metrics" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_coeff_lookup" ON "coefficient_templates" USING btree ("school_year_template_id","grade_id","series_id","subject_id");--> statement-breakpoint
CREATE INDEX "idx_coeff_year" ON "coefficient_templates" USING btree ("school_year_template_id");--> statement-breakpoint
CREATE INDEX "idx_coeff_grade" ON "coefficient_templates" USING btree ("grade_id");--> statement-breakpoint
CREATE INDEX "idx_coeff_subject" ON "coefficient_templates" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "idx_fee_template_code" ON "fee_type_templates" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_fee_template_category" ON "fee_type_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_fee_template_active" ON "fee_type_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_accounts_school" ON "accounts" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_accounts_parent" ON "accounts" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_accounts_type" ON "accounts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_accounts_code" ON "accounts" USING btree ("school_id","code");--> statement-breakpoint
CREATE INDEX "idx_accounts_hierarchy" ON "accounts" USING btree ("school_id","level","parent_id");--> statement-breakpoint
CREATE INDEX "idx_alerts_school" ON "attendance_alerts" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_alerts_status" ON "attendance_alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_alerts_type" ON "attendance_alerts" USING btree ("alert_type");--> statement-breakpoint
CREATE INDEX "idx_alerts_teacher" ON "attendance_alerts" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "idx_alerts_student" ON "attendance_alerts" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_alerts_active" ON "attendance_alerts" USING btree ("school_id","status");--> statement-breakpoint
CREATE INDEX "idx_attendance_settings_school" ON "attendance_settings" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_audit_school_time" ON "audit_logs" USING btree ("school_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_audit_user" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_table_record" ON "audit_logs" USING btree ("table_name","record_id");--> statement-breakpoint
CREATE INDEX "idx_audit_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_chapter_completions_class" ON "chapter_completions" USING btree ("class_id","subject_id");--> statement-breakpoint
CREATE INDEX "idx_chapter_completions_chapter" ON "chapter_completions" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "idx_class_sessions_class_subject" ON "class_sessions" USING btree ("class_id","subject_id");--> statement-breakpoint
CREATE INDEX "idx_class_sessions_chapter" ON "class_sessions" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "idx_class_sessions_date" ON "class_sessions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_class_sessions_teacher" ON "class_sessions" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "idx_class_sessions_status" ON "class_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_class_subjects_teacher" ON "class_subjects" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "idx_class_subjects_class_subject" ON "class_subjects" USING btree ("class_id","subject_id");--> statement-breakpoint
CREATE INDEX "idx_class_subjects_teacher_subject" ON "class_subjects" USING btree ("teacher_id","subject_id");--> statement-breakpoint
CREATE INDEX "idx_classes_school" ON "classes" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_classes_school_year" ON "classes" USING btree ("school_year_id");--> statement-breakpoint
CREATE INDEX "idx_classes_homeroom" ON "classes" USING btree ("homeroom_teacher_id");--> statement-breakpoint
CREATE INDEX "idx_classes_classroom" ON "classes" USING btree ("classroom_id");--> statement-breakpoint
CREATE INDEX "idx_classes_school_year_composite" ON "classes" USING btree ("school_id","school_year_id");--> statement-breakpoint
CREATE INDEX "idx_classes_grade_series" ON "classes" USING btree ("grade_id","series_id");--> statement-breakpoint
CREATE INDEX "idx_classrooms_school" ON "classrooms" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_classrooms_type" ON "classrooms" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_classrooms_status" ON "classrooms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_classrooms_school_status_type" ON "classrooms" USING btree ("school_id","status","type");--> statement-breakpoint
CREATE INDEX "idx_follow_ups_conduct" ON "conduct_follow_ups" USING btree ("conduct_record_id");--> statement-breakpoint
CREATE INDEX "idx_follow_ups_date" ON "conduct_follow_ups" USING btree ("follow_up_date");--> statement-breakpoint
CREATE INDEX "idx_conduct_student" ON "conduct_records" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_conduct_school_year" ON "conduct_records" USING btree ("school_id","school_year_id");--> statement-breakpoint
CREATE INDEX "idx_conduct_type" ON "conduct_records" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_conduct_category" ON "conduct_records" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_conduct_status" ON "conduct_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_conduct_severity" ON "conduct_records" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_conduct_date" ON "conduct_records" USING btree ("incident_date");--> statement-breakpoint
CREATE INDEX "idx_conduct_student_year" ON "conduct_records" USING btree ("student_id","school_year_id");--> statement-breakpoint
CREATE INDEX "idx_progress_class" ON "curriculum_progress" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "idx_progress_status" ON "curriculum_progress" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_progress_term" ON "curriculum_progress" USING btree ("term_id");--> statement-breakpoint
CREATE INDEX "idx_progress_subject" ON "curriculum_progress" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "idx_discounts_school" ON "discounts" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_discounts_type" ON "discounts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_discounts_status" ON "discounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_enrollments_student" ON "enrollments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_enrollments_class" ON "enrollments" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "idx_enrollments_school_year" ON "enrollments" USING btree ("school_year_id");--> statement-breakpoint
CREATE INDEX "idx_enrollments_class_year_status" ON "enrollments" USING btree ("class_id","school_year_id","status");--> statement-breakpoint
CREATE INDEX "idx_enrollments_student_year" ON "enrollments" USING btree ("student_id","school_year_id");--> statement-breakpoint
CREATE INDEX "idx_enrollments_student_year_status" ON "enrollments" USING btree ("student_id","school_year_id","status");--> statement-breakpoint
CREATE INDEX "idx_enrollments_status" ON "enrollments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_enrollments_confirmed_by" ON "enrollments" USING btree ("confirmed_by");--> statement-breakpoint
CREATE INDEX "idx_enrollments_roll_number" ON "enrollments" USING btree ("class_id","roll_number");--> statement-breakpoint
CREATE INDEX "idx_fee_structures_school_year" ON "fee_structures" USING btree ("school_id","school_year_id");--> statement-breakpoint
CREATE INDEX "idx_fee_structures_grade" ON "fee_structures" USING btree ("grade_id");--> statement-breakpoint
CREATE INDEX "idx_fee_structures_fee_type" ON "fee_structures" USING btree ("fee_type_id");--> statement-breakpoint
CREATE INDEX "idx_fee_structures_lookup" ON "fee_structures" USING btree ("school_id","school_year_id","grade_id");--> statement-breakpoint
CREATE INDEX "idx_fee_types_school" ON "fee_types" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_fee_types_template" ON "fee_types" USING btree ("fee_type_template_id");--> statement-breakpoint
CREATE INDEX "idx_fee_types_category" ON "fee_types" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_fee_types_status" ON "fee_types" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_fiscal_years_school" ON "fiscal_years" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_fiscal_years_status" ON "fiscal_years" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_fiscal_years_dates" ON "fiscal_years" USING btree ("school_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "idx_validations_grade" ON "grade_validations" USING btree ("grade_id");--> statement-breakpoint
CREATE INDEX "idx_validations_validator" ON "grade_validations" USING btree ("validator_id");--> statement-breakpoint
CREATE INDEX "idx_homework_class" ON "homework" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "idx_homework_teacher_status" ON "homework" USING btree ("teacher_id","status");--> statement-breakpoint
CREATE INDEX "idx_homework_due_date" ON "homework" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_homework_status" ON "homework" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_homework_class_due" ON "homework" USING btree ("class_id","due_date");--> statement-breakpoint
CREATE INDEX "idx_submission_homework" ON "homework_submissions" USING btree ("homework_id");--> statement-breakpoint
CREATE INDEX "idx_submission_student" ON "homework_submissions" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_installments_plan" ON "installments" USING btree ("payment_plan_id");--> statement-breakpoint
CREATE INDEX "idx_installments_due_date" ON "installments" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_installments_status" ON "installments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_matricule_seq_school_year" ON "matricule_sequences" USING btree ("school_id","school_year_id");--> statement-breakpoint
CREATE INDEX "idx_templates_school" ON "message_templates" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_templates_category" ON "message_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_parents_user" ON "parents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_parents_phone" ON "parents" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_parents_email" ON "parents" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_parents_phone2" ON "parents" USING btree ("phone_2");--> statement-breakpoint
CREATE INDEX "idx_parents_invitation_status" ON "parents" USING btree ("invitation_status");--> statement-breakpoint
CREATE INDEX "idx_parents_name" ON "parents" USING btree ("last_name","first_name");--> statement-breakpoint
CREATE INDEX "idx_participation_session" ON "participation_grades" USING btree ("class_session_id");--> statement-breakpoint
CREATE INDEX "idx_participation_student" ON "participation_grades" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_participation_teacher" ON "participation_grades" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "idx_payment_allocations_payment" ON "payment_allocations" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "idx_payment_allocations_fee" ON "payment_allocations" USING btree ("student_fee_id");--> statement-breakpoint
CREATE INDEX "idx_payment_allocations_installment" ON "payment_allocations" USING btree ("installment_id");--> statement-breakpoint
CREATE INDEX "idx_payment_plan_templates_school" ON "payment_plan_templates" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_payment_plan_templates_year" ON "payment_plan_templates" USING btree ("school_year_id");--> statement-breakpoint
CREATE INDEX "idx_payment_plans_student" ON "payment_plans" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_payment_plans_year" ON "payment_plans" USING btree ("school_year_id");--> statement-breakpoint
CREATE INDEX "idx_payment_plans_status" ON "payment_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payments_school" ON "payments" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_payments_student" ON "payments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_payments_plan" ON "payments" USING btree ("payment_plan_id");--> statement-breakpoint
CREATE INDEX "idx_payments_date" ON "payments" USING btree ("school_id","payment_date");--> statement-breakpoint
CREATE INDEX "idx_payments_method" ON "payments" USING btree ("method");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payments_receipt" ON "payments" USING btree ("school_id","receipt_number");--> statement-breakpoint
CREATE INDEX "idx_payments_processed_by" ON "payments" USING btree ("processed_by","payment_date");--> statement-breakpoint
CREATE INDEX "idx_receipts_payment" ON "receipts" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "idx_receipts_number" ON "receipts" USING btree ("receipt_number");--> statement-breakpoint
CREATE INDEX "idx_receipts_date" ON "receipts" USING btree ("payment_date");--> statement-breakpoint
CREATE INDEX "idx_refunds_payment" ON "refunds" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "idx_refunds_school" ON "refunds" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_refunds_status" ON "refunds" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_refunds_date" ON "refunds" USING btree ("school_id","requested_at");--> statement-breakpoint
CREATE INDEX "idx_report_templates_school" ON "report_card_templates" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_report_cards_class_term" ON "report_cards" USING btree ("class_id","term_id");--> statement-breakpoint
CREATE INDEX "idx_report_cards_status" ON "report_cards" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_report_cards_student" ON "report_cards" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_report_cards_school_year" ON "report_cards" USING btree ("school_year_id");--> statement-breakpoint
CREATE INDEX "idx_roles_slug" ON "roles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_roles_scope" ON "roles" USING btree ("scope");--> statement-breakpoint
CREATE INDEX "idx_school_files_school" ON "school_files" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_school_files_entity" ON "school_files" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_school_files_deleted_at" ON "school_files" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_school_coeffs_school" ON "school_subject_coefficients" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_school_coeffs_template" ON "school_subject_coefficients" USING btree ("coefficient_template_id");--> statement-breakpoint
CREATE INDEX "idx_school_coeffs_lookup" ON "school_subject_coefficients" USING btree ("school_id","coefficient_template_id");--> statement-breakpoint
CREATE INDEX "idx_school_subjects_school" ON "school_subjects" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_school_subjects_year" ON "school_subjects" USING btree ("school_year_id");--> statement-breakpoint
CREATE INDEX "idx_school_subjects_status" ON "school_subjects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_school_subjects_lookup" ON "school_subjects" USING btree ("school_id","school_year_id","status");--> statement-breakpoint
CREATE INDEX "idx_school_years_school" ON "school_years" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_school_years_active" ON "school_years" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_school_years_school_active" ON "school_years" USING btree ("school_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_staff_user" ON "staff" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_staff_school" ON "staff" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_staff_position" ON "staff" USING btree ("position");--> statement-breakpoint
CREATE INDEX "idx_student_attendance_student_date" ON "student_attendance" USING btree ("student_id","date");--> statement-breakpoint
CREATE INDEX "idx_student_attendance_class_date_session" ON "student_attendance" USING btree ("class_id","date","class_session_id");--> statement-breakpoint
CREATE INDEX "idx_student_attendance_session" ON "student_attendance" USING btree ("class_session_id");--> statement-breakpoint
CREATE INDEX "idx_student_attendance_status" ON "student_attendance" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_student_attendance_school_date_status" ON "student_attendance" USING btree ("school_id","date","status");--> statement-breakpoint
CREATE INDEX "idx_averages_student_term" ON "student_averages" USING btree ("student_id","term_id");--> statement-breakpoint
CREATE INDEX "idx_averages_class_term" ON "student_averages" USING btree ("class_id","term_id");--> statement-breakpoint
CREATE INDEX "idx_averages_class_term_final" ON "student_averages" USING btree ("class_id","term_id","is_final");--> statement-breakpoint
CREATE INDEX "idx_student_discounts_student" ON "student_discounts" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_student_discounts_year" ON "student_discounts" USING btree ("school_year_id");--> statement-breakpoint
CREATE INDEX "idx_student_discounts_status" ON "student_discounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_student_fees_student" ON "student_fees" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_student_fees_enrollment" ON "student_fees" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "idx_student_fees_status" ON "student_fees" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_grades_student_term_subject" ON "student_grades" USING btree ("student_id","term_id","subject_id");--> statement-breakpoint
CREATE INDEX "idx_grades_class_subject_term" ON "student_grades" USING btree ("class_id","subject_id","term_id");--> statement-breakpoint
CREATE INDEX "idx_grades_teacher_status" ON "student_grades" USING btree ("teacher_id","status");--> statement-breakpoint
CREATE INDEX "idx_grades_status" ON "student_grades" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_grades_term_status" ON "student_grades" USING btree ("term_id","status");--> statement-breakpoint
CREATE INDEX "idx_grades_class_term" ON "student_grades" USING btree ("class_id","term_id");--> statement-breakpoint
CREATE INDEX "idx_student_parents_composite" ON "student_parents" USING btree ("student_id","parent_id");--> statement-breakpoint
CREATE INDEX "idx_student_parents_parent" ON "student_parents" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_student_parents_primary" ON "student_parents" USING btree ("student_id","is_primary");--> statement-breakpoint
CREATE INDEX "idx_students_school" ON "students" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_students_matricule" ON "students" USING btree ("matricule");--> statement-breakpoint
CREATE INDEX "idx_students_status" ON "students" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_students_school_status" ON "students" USING btree ("school_id","status");--> statement-breakpoint
CREATE INDEX "idx_students_name" ON "students" USING btree ("last_name","first_name");--> statement-breakpoint
CREATE INDEX "idx_students_dob" ON "students" USING btree ("dob");--> statement-breakpoint
CREATE INDEX "idx_students_admission" ON "students" USING btree ("school_id","admission_date");--> statement-breakpoint
CREATE INDEX "idx_teacher_attendance_teacher_date" ON "teacher_attendance" USING btree ("teacher_id","date");--> statement-breakpoint
CREATE INDEX "idx_teacher_attendance_school_date" ON "teacher_attendance" USING btree ("school_id","date");--> statement-breakpoint
CREATE INDEX "idx_teacher_attendance_status" ON "teacher_attendance" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_teacher_attendance_date_range" ON "teacher_attendance" USING btree ("school_id","date");--> statement-breakpoint
CREATE INDEX "idx_teacher_comments_report" ON "teacher_comments" USING btree ("report_card_id");--> statement-breakpoint
CREATE INDEX "idx_teacher_comments_teacher" ON "teacher_comments" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "idx_messages_sender" ON "teacher_messages" USING btree ("sender_type","sender_id");--> statement-breakpoint
CREATE INDEX "idx_messages_recipient_archived" ON "teacher_messages" USING btree ("recipient_type","recipient_id","is_archived");--> statement-breakpoint
CREATE INDEX "idx_messages_thread_created" ON "teacher_messages" USING btree ("thread_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_messages_created" ON "teacher_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_teacher" ON "teacher_notifications" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_created" ON "teacher_notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_teacher_subjects_composite" ON "teacher_subjects" USING btree ("teacher_id","subject_id");--> statement-breakpoint
CREATE INDEX "idx_teachers_user" ON "teachers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_teachers_school" ON "teachers" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_teachers_school_status" ON "teachers" USING btree ("school_id","status");--> statement-breakpoint
CREATE INDEX "idx_terms_school_year" ON "terms" USING btree ("school_year_id");--> statement-breakpoint
CREATE INDEX "idx_timetable_class_day" ON "timetable_sessions" USING btree ("class_id","day_of_week");--> statement-breakpoint
CREATE INDEX "idx_timetable_teacher_day" ON "timetable_sessions" USING btree ("teacher_id","day_of_week");--> statement-breakpoint
CREATE INDEX "idx_timetable_classroom_day" ON "timetable_sessions" USING btree ("classroom_id","day_of_week");--> statement-breakpoint
CREATE INDEX "idx_timetable_conflicts" ON "timetable_sessions" USING btree ("school_id","day_of_week","start_time","end_time");--> statement-breakpoint
CREATE INDEX "idx_timetable_school_year_day" ON "timetable_sessions" USING btree ("school_id","school_year_id","day_of_week");--> statement-breakpoint
CREATE INDEX "idx_transaction_lines_transaction" ON "transaction_lines" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_transaction_lines_account" ON "transaction_lines" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_transaction_lines_amounts" ON "transaction_lines" USING btree ("account_id","debit_amount","credit_amount");--> statement-breakpoint
CREATE INDEX "idx_transactions_school" ON "transactions" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_fiscal_year" ON "transactions" USING btree ("fiscal_year_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_date" ON "transactions" USING btree ("school_id","date");--> statement-breakpoint
CREATE INDEX "idx_transactions_type" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_transactions_status" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_user_roles_composite" ON "user_roles" USING btree ("user_id","school_id","role_id");--> statement-breakpoint
CREATE INDEX "idx_user_roles_school" ON "user_roles" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_user_schools_user" ON "user_schools" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_schools_school" ON "user_schools" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_user_schools_composite" ON "user_schools" USING btree ("user_id","school_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_phone" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_users_status" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_users_auth_user" ON "users" USING btree ("auth_user_id");--> statement-breakpoint
CREATE INDEX "idx_crm_activities_contact" ON "crm_activities" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "idx_crm_activities_school" ON "crm_activities" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_crm_activities_type" ON "crm_activities" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_crm_activities_created" ON "crm_activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_crm_contacts_school" ON "crm_contacts" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_crm_contacts_email" ON "crm_contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_crm_contacts_name" ON "crm_contacts" USING btree ("contact_name");--> statement-breakpoint
CREATE INDEX "idx_crm_contacts_followup" ON "crm_contacts" USING btree ("next_follow_up");--> statement-breakpoint
CREATE INDEX "idx_crm_tasks_contact" ON "crm_tasks" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "idx_crm_tasks_school" ON "crm_tasks" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_crm_tasks_user" ON "crm_tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_crm_tasks_status" ON "crm_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_crm_tasks_due" ON "crm_tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_kb_articles_category" ON "knowledge_base_articles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_kb_articles_published" ON "knowledge_base_articles" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_kb_articles_views" ON "knowledge_base_articles" USING btree ("views");--> statement-breakpoint
CREATE INDEX "idx_kb_articles_featured" ON "knowledge_base_articles" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_school" ON "support_tickets" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_status" ON "support_tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_priority" ON "support_tickets" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_assignee" ON "support_tickets" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_created" ON "support_tickets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_school_status" ON "support_tickets" USING btree ("school_id","status");--> statement-breakpoint
CREATE INDEX "idx_ticket_comments_ticket" ON "ticket_comments" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_comments_user" ON "ticket_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_comments_created" ON "ticket_comments" USING btree ("created_at");