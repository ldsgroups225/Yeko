# @repo/queue-worker — Agent Guide

> **Cloudflare Queue consumer worker**. Processes background tasks dispatched by other apps via `@repo/background-tasks`.
> Deployed to **Cloudflare Workers** via Wrangler.

---

## Quick Reference

| Action | Command |
| --- | --- |
| Dev server | `pnpm dev` |
| Deploy | `pnpm deploy` |
| Typecheck | `pnpm typecheck` |
| Lint + fix | `pnpm lint:fix` |
| CF type gen | `pnpm cf-typegen` |

---

## Directory Structure

```text
src/
├── index.ts               # Worker entry — queue message handler
├── types.ts               # Message type definitions
└── handlers/
    └── *.ts               # Individual task handlers (one per task type)
```

---

## Dependencies

- `@repo/background-tasks` — shared task type definitions
- `@repo/data-ops` — database access for processing tasks that need DB writes

---

## How It Works

1. **Producer** (e.g., `apps/school`) sends messages to a CF Queue via `@repo/background-tasks`
2. **This worker** receives batched messages and routes them to the appropriate handler
3. Handlers execute the background work (logging, data processing, etc.)

---

## Do NOT

- ❌ Import React or UI code — this is a headless worker
- ❌ Use database transactions (Neon HTTP driver limitation)
- ❌ Block the queue handler with long-running synchronous work
