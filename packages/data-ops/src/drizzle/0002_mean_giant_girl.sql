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
ALTER TABLE "parents" DROP CONSTRAINT "parents_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "parents" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "confirmed_by" text;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "cancelled_by" text;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "cancellation_reason" text;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "transferred_at" timestamp;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "transferred_to" text;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "transfer_reason" text;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "previous_enrollment_id" text;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "roll_number" integer;--> statement-breakpoint
ALTER TABLE "parents" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "parents" ADD COLUMN "last_name" text;--> statement-breakpoint
UPDATE "parents" p SET 
  "first_name" = COALESCE(SPLIT_PART(u."name", ' ', 1), 'Unknown'),
  "last_name" = COALESCE(NULLIF(SPLIT_PART(u."name", ' ', 2), ''), 'Unknown')
FROM "users" u WHERE p."user_id" = u."id";--> statement-breakpoint
UPDATE "parents" SET "first_name" = 'Unknown', "last_name" = 'Unknown' WHERE "first_name" IS NULL;--> statement-breakpoint
ALTER TABLE "parents" ALTER COLUMN "first_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "parents" ALTER COLUMN "last_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "parents" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "parents" ADD COLUMN "phone_2" text;--> statement-breakpoint
ALTER TABLE "parents" ADD COLUMN "occupation" text;--> statement-breakpoint
ALTER TABLE "parents" ADD COLUMN "workplace" text;--> statement-breakpoint
ALTER TABLE "parents" ADD COLUMN "invitation_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "parents" ADD COLUMN "invitation_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "parents" ADD COLUMN "invitation_token" text;--> statement-breakpoint
ALTER TABLE "parents" ADD COLUMN "invitation_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "student_parents" ADD COLUMN "can_pickup" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "student_parents" ADD COLUMN "receive_notifications" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "student_parents" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "birth_place" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "nationality" text DEFAULT 'Ivoirien';--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "emergency_contact" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "emergency_phone" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "blood_type" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "medical_notes" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "previous_school" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "admission_date" date;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "graduation_date" date;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "transfer_date" date;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "transfer_reason" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "withdrawal_date" date;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "withdrawal_reason" text;--> statement-breakpoint
ALTER TABLE "matricule_sequences" ADD CONSTRAINT "matricule_sequences_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matricule_sequences" ADD CONSTRAINT "matricule_sequences_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_matricule_seq_school_year" ON "matricule_sequences" USING btree ("school_id","school_year_id");--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_confirmed_by_users_id_fk" FOREIGN KEY ("confirmed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_cancelled_by_users_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_transferred_to_classes_id_fk" FOREIGN KEY ("transferred_to") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parents" ADD CONSTRAINT "parents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_enrollments_status" ON "enrollments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_enrollments_confirmed_by" ON "enrollments" USING btree ("confirmed_by");--> statement-breakpoint
CREATE INDEX "idx_enrollments_roll_number" ON "enrollments" USING btree ("class_id","roll_number");--> statement-breakpoint
CREATE INDEX "idx_parents_email" ON "parents" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_parents_phone2" ON "parents" USING btree ("phone_2");--> statement-breakpoint
CREATE INDEX "idx_parents_invitation_status" ON "parents" USING btree ("invitation_status");--> statement-breakpoint
CREATE INDEX "idx_parents_name" ON "parents" USING btree ("last_name","first_name");--> statement-breakpoint
CREATE INDEX "idx_student_parents_primary" ON "student_parents" USING btree ("student_id","is_primary");--> statement-breakpoint
CREATE INDEX "idx_students_name" ON "students" USING btree ("last_name","first_name");--> statement-breakpoint
CREATE INDEX "idx_students_dob" ON "students" USING btree ("dob");--> statement-breakpoint
CREATE INDEX "idx_students_admission" ON "students" USING btree ("school_id","admission_date");
