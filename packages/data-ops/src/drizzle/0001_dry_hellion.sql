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