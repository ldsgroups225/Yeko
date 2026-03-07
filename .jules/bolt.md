
## 2024-03-06 - Refactoring iteration into single bulk upsert in Postgres with Drizzle
**Learning:** For performance, replacing N+1 iterative `.insert(...).onConflictDoUpdate()` operations with a single `.insert().values(array).onConflictDoUpdate(...)` provides O(1) database latency. To handle values appropriately during the conflict update in PostgreSQL via Drizzle, `sql.raw` with `EXCLUDED."column_name"` must be utilized for column updates to reference the pseudo-table of excluded rows reliably.
**Action:** When updating iterating insert loops to bulk operations in Postgres with Drizzle, always verify the bulk `onConflictDoUpdate` utilizes the `EXCLUDED` table correctly to apply dynamic updates.
