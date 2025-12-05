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
ALTER TABLE "classes" DROP CONSTRAINT "classes_classroom_id_classrooms_id_fk";
--> statement-breakpoint
ALTER TABLE "classes" DROP CONSTRAINT "classes_homeroom_teacher_id_teachers_id_fk";
--> statement-breakpoint
DROP INDEX "idx_classrooms_school_code";--> statement-breakpoint
ALTER TABLE "classrooms" ALTER COLUMN "capacity" SET DEFAULT 30;--> statement-breakpoint
ALTER TABLE "classrooms" ALTER COLUMN "capacity" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "classrooms" ALTER COLUMN "equipment" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "max_students" integer DEFAULT 40 NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "classrooms" ADD COLUMN "floor" text;--> statement-breakpoint
ALTER TABLE "classrooms" ADD COLUMN "building" text;--> statement-breakpoint
ALTER TABLE "classrooms" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "classrooms" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_class_subjects_teacher" ON "class_subjects" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "idx_class_subjects_class_subject" ON "class_subjects" USING btree ("class_id","subject_id");--> statement-breakpoint
CREATE INDEX "idx_class_subjects_teacher_subject" ON "class_subjects" USING btree ("teacher_id","subject_id");--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_homeroom_teacher_id_teachers_id_fk" FOREIGN KEY ("homeroom_teacher_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_classes_classroom" ON "classes" USING btree ("classroom_id");--> statement-breakpoint
CREATE INDEX "idx_classrooms_type" ON "classrooms" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_classrooms_status" ON "classrooms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_classrooms_school_status_type" ON "classrooms" USING btree ("school_id","status","type");