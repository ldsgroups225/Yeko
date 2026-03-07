## 2025-02-13 - [SQL Injection in Drizzle-ORM Intervals]
**Vulnerability:** Found `sql.raw()` being used to interpolate unvalidated inputs (months) into SQL query dynamic intervals in `finance-stats.ts` and `teacher-student-attendance.ts`.
**Learning:** Even with an ORM, SQL injection can occur when using raw sql template helpers for dynamic date interval arithmetic, especially when standard interpolation doesn't immediately match the desired dialect's string format requirements (e.g. `INTERVAL '1 month'` or `date('now', '-X month')`).
**Prevention:** For Postgres, use parameterized interval multiplication `CURRENT_DATE - INTERVAL '1 month' * ${months}`. For SQLite, parameterize the modifier directly in the template literal `date('now', ${`-${months} month`})`. Never use `sql.raw()` for user inputs.

## 2025-03-08 - [SQL Injection in Drizzle-ORM UPSERTs]
**Vulnerability:** Found `sql.raw()` being used in `packages/data-ops/src/queries/school-coefficients.ts` for referencing the `EXCLUDED` table during an `onConflictDoUpdate` operation (`weightOverride: sql.raw(\`EXCLUDED."${schoolSubjectCoefficients.weightOverride.name}"\`))`).
**Learning:** While the input was a static schema value, using `sql.raw` bypasses ORM protections, creating a latent risk if the string construction is ever altered or exposed to dynamic parameters.
**Prevention:** Always use safe `sql` template literals for references (e.g., `sql\`EXCLUDED.weight_override\``) and entirely avoid `sql.raw()` in application code queries to adhere to defense-in-depth principles.
