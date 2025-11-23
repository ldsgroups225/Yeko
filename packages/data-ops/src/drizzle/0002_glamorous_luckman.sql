CREATE TABLE "program_template_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"program_template_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"snapshot_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "program_templates" ADD COLUMN "status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "program_template_versions" ADD CONSTRAINT "program_template_versions_program_template_id_program_templates_id_fk" FOREIGN KEY ("program_template_id") REFERENCES "public"."program_templates"("id") ON DELETE no action ON UPDATE no action;