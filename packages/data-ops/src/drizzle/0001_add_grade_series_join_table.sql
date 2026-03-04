CREATE TABLE "grade_series" (
	"id" text PRIMARY KEY NOT NULL,
	"grade_id" text NOT NULL,
	"series_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_grade_series" UNIQUE("grade_id","series_id")
);
--> statement-breakpoint
ALTER TABLE "grade_series" ADD CONSTRAINT "grade_series_grade_id_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade_series" ADD CONSTRAINT "grade_series_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "grade_series" ("id", "grade_id", "series_id")
SELECT DISTINCT
  md5(source_pairs.grade_id || ':' || source_pairs.series_id) AS id,
  source_pairs.grade_id,
  source_pairs.series_id
FROM (
  SELECT "grade_id", "series_id"
  FROM "classes"
  WHERE "series_id" IS NOT NULL

  UNION

  SELECT "grade_id", "series_id"
  FROM "fee_structures"
  WHERE "grade_id" IS NOT NULL
    AND "series_id" IS NOT NULL

  UNION

  SELECT "grade_id", "series_id"
  FROM "coefficient_templates"
  WHERE "series_id" IS NOT NULL

  UNION

  SELECT g."id" AS grade_id, s."id" AS series_id
  FROM "grades" g
  INNER JOIN "series" s ON s."track_id" = g."track_id"
    AND s."code" = ANY (
      CASE g."code"
        WHEN '2NDE' THEN ARRAY['A', 'C']::text[]
        WHEN '1ERE' THEN ARRAY['A', 'A1', 'A2', 'C', 'D']::text[]
        WHEN 'TERM' THEN ARRAY['A', 'A1', 'A2', 'C', 'D']::text[]
        ELSE ARRAY[]::text[]
      END
    )
) AS source_pairs
ON CONFLICT ("grade_id", "series_id") DO NOTHING;
--> statement-breakpoint
CREATE INDEX "idx_grade_series_grade" ON "grade_series" USING btree ("grade_id");--> statement-breakpoint
CREATE INDEX "idx_grade_series_series" ON "grade_series" USING btree ("series_id");
