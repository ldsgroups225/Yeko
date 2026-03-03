CREATE INDEX "idx_payments_school_date_created" ON "payments" USING btree ("school_id","payment_date" DESC,"created_at" DESC);
--> statement-breakpoint
CREATE INDEX "idx_payments_school_status_date" ON "payments" USING btree ("school_id","status","payment_date" DESC);
--> statement-breakpoint
CREATE INDEX "idx_payments_school_processed_date" ON "payments" USING btree ("school_id","processed_by","payment_date" DESC);
