## 2026-03-04 - [N+1 Query in Support Tickets]
**Learning:** Found an N+1 query vulnerability when getting the comment count for each ticket in `getTickets` because it used `Promise.all(tickets.map(...))`.
**Action:** Always batch queries with `inArray` or lateral joins to avoid Drizzle N+1.

## 2024-03-06 - Refactoring iteration into single bulk upsert in Postgres with Drizzle
**Learning:** For performance, replacing N+1 iterative `.insert(...).onConflictDoUpdate()` operations with a single `.insert().values(array).onConflictDoUpdate(...)` provides O(1) database latency. To handle values appropriately during the conflict update in PostgreSQL via Drizzle, `sql.raw` with `EXCLUDED."column_name"` must be utilized for column updates to reference the pseudo-table of excluded rows reliably.
**Action:** When updating iterating insert loops to bulk operations in Postgres with Drizzle, always verify the bulk `onConflictDoUpdate` utilizes the `EXCLUDED` table correctly to apply dynamic updates.

## 2024-05-15 - [Refactoring bulk update with dynamic fields using CASE statement]
**Learning:** Drizzle bulk update on single fields via \`CASE WHEN\` prevents N+1 query problems natively in Cloudflare/Neon environments where \`insert...onConflictDoUpdate\` might be unfeasible.
**Action:** When updating a single field for multiple items using their specific ID, assemble a \`sql\` query concatenating a \`CASE WHEN id = value THEN updated_field_value END\` pattern mapped to Drizzle's \`sql\` and run it using a single \`.update().set().where(inArray())\` instead of an iterative \`Promise.all(...\` mapping over array elements.
