CREATE TABLE "receipt_sequences" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"sequence_year" integer NOT NULL,
	"prefix" text NOT NULL,
	"last_number" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_receipt_sequences_school_year" UNIQUE("school_id","sequence_year")
);
--> statement-breakpoint
ALTER TABLE "receipt_sequences" ADD CONSTRAINT "receipt_sequences_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_receipt_sequences_school_year" ON "receipt_sequences" USING btree ("school_id","sequence_year");
