# apps/school DB Observability Runbook

## Purpose

This runbook captures repeatable DB performance evidence for the `apps/school` optimizer cycle:

- `EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT JSON)` snapshots for the highest-impact read paths.
- API latency dashboard queries (p50/p95/error-rate) using `api_metrics`.

## 1) Capture EXPLAIN snapshots

Run from repo root:

```bash
SCHOOL_DB_EXPLAIN_DATABASE_URL="$DATABASE_URL" \
pnpm --filter yeko-school db:explain:snapshot
```

Alternative (no `DATABASE_URL` needed):

```bash
DATABASE_HOST="..." \
DATABASE_USERNAME="..." \
DATABASE_PASSWORD="..." \
pnpm --filter yeko-school db:explain:snapshot
```

Optional overrides:

- `SCHOOL_DB_EXPLAIN_SAMPLE_LIMIT` (default `100`)
- `SCHOOL_DB_EXPLAIN_DIR` (default `docs/perf/db-observability`)
- `DATABASE_NAME` (default `neondb` when URL is auto-built)
- `DATABASE_SSLMODE` (default `verify-full` when URL is auto-built)

Output files:

- `docs/perf/db-observability/school-db-explain-<timestamp>.json`
- `docs/perf/db-observability/latest.json`

## 1b) Generate evidence summary (markdown)

After a snapshot, generate a markdown summary:

```bash
pnpm --filter yeko-school db:explain:summary
```

Optional comparison with a baseline snapshot:

```bash
SCHOOL_DB_EXPLAIN_BASELINE="docs/perf/db-observability/school-db-explain-<baseline>.json" \
pnpm --filter yeko-school db:explain:summary
```

Summary output:

- `docs/perf/db-observability/latest-summary.md`

The snapshot currently includes these query families when sample IDs exist:

1. `payments.list.recent`
2. `payments.list.by_status`
3. `students.list.by_year`
4. `classes.list.by_year`
5. `timetable.by_class`
6. `timetable.by_teacher`
7. `timetable.by_classroom`
8. `report_cards.by_class_term`
9. `curriculum_progress.by_class_term`
10. `student_averages.by_class_term`

## 2) Dashboard queries (SQL)

Use these in Metabase/Grafana (PostgreSQL source). Replace `:school_id` with a parameter.

### A. p50/p95 latency by endpoint (24h)

```sql
SELECT
  endpoint,
  method,
  percentile_disc(0.50) WITHIN GROUP (ORDER BY response_time_ms) AS p50_ms,
  percentile_disc(0.95) WITHIN GROUP (ORDER BY response_time_ms) AS p95_ms,
  COUNT(*) AS calls
FROM api_metrics
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND school_id = :school_id
GROUP BY endpoint, method
ORDER BY p95_ms DESC, calls DESC;
```

### B. Error rate by endpoint (24h)

```sql
SELECT
  endpoint,
  method,
  COUNT(*) AS total_calls,
  COUNT(*) FILTER (WHERE status_code >= 500) AS server_errors,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status_code >= 500)::numeric / NULLIF(COUNT(*), 0),
    2
  ) AS server_error_rate_pct
FROM api_metrics
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND school_id = :school_id
GROUP BY endpoint, method
ORDER BY server_error_rate_pct DESC, total_calls DESC;
```

### C. Slowest time buckets (last 6h)

```sql
SELECT
  date_trunc('minute', created_at) AS minute_bucket,
  percentile_disc(0.95) WITHIN GROUP (ORDER BY response_time_ms) AS p95_ms
FROM api_metrics
WHERE created_at >= NOW() - INTERVAL '6 hours'
  AND school_id = :school_id
GROUP BY minute_bucket
ORDER BY minute_bucket ASC;
```

## 3) Review checklist

- Confirm `latest.json` includes at least 8 targets captured.
- Prioritize targets with highest `executionTimeMs`.
- For each high target:
  - Check `planStats.seqScanNodes` and `totalSharedReadBlocks`.
  - Propose index/plan changes only when a measurable bottleneck appears.
- Re-run snapshot after index/query changes and compare `p50ExecutionMs` / `p95ExecutionMs`.

## 4) CI workflow (network-enabled runner)

A manual GitHub workflow is available at:

- `.github/workflows/school-db-explain.yml`

It runs:

1. `pnpm --filter yeko-school db:explain:snapshot`
2. `pnpm --filter yeko-school db:explain:summary`
3. uploads artifacts from `docs/perf/db-observability/`

Required repository secret:

- `SCHOOL_DB_EXPLAIN_DATABASE_URL_STAGING`

Optional workflow-dispatch inputs:

- `sample_limit` (default `100`)
- `baseline_file` (path used by `SCHOOL_DB_EXPLAIN_BASELINE`)
