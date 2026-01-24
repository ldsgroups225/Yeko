ALTER TABLE "grades" ALTER COLUMN "order" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "school_id" DROP NOT NULL;