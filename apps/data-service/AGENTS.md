# Yeko Data Service — Agent Guide

> **HTTP API service** built with Hono on Cloudflare Workers.
> Provides REST endpoints for data operations, durable objects, and workflow orchestration.

See @../../AGENTS.md for project-wide rules, security protocols, and the Result-oriented framework.

---

## Quick Reference

| Action | Command |
| --- | --- |
| Dev server | `pnpm dev` (Wrangler dev with remote bindings) |
| Deploy | `pnpm deploy` |
| Typecheck | `pnpm typecheck` |
| Lint + fix | `pnpm lint:fix` |
| Unit tests | `pnpm test` |
| CF type gen | `pnpm cf-typegen` |

---

## Tech Stack

- **Framework:** Hono (lightweight HTTP framework for CF Workers)
- **Runtime:** Cloudflare Workers
- **Data:** `@repo/data-ops` (Drizzle ORM, Neon)
- **Validation:** Zod
- **Testing:** Vitest with `@cloudflare/vitest-pool-workers`

---

## Directory Structure

```text
src/
├── index.ts               # Worker entry — WorkerEntrypoint class, delegates to Hono app
├── hono/
│   └── app.ts             # Hono app definition and route registration
├── durable-objects/        # Cloudflare Durable Objects
│   └── ...
└── workflows/              # Cloudflare Workflows
    └── ...
```

---

## Key Patterns

### Worker Entrypoint

The service uses `WorkerEntrypoint` (not the default export pattern):

```typescript
import { WorkerEntrypoint } from 'cloudflare:workers'
import { app } from '@/hono/app'

export default class DataService extends WorkerEntrypoint<Env> {
  fetch(request: Request) {
    return app.fetch(request, this.env, this.ctx)
  }
}
```

### Hono Routes

All API routes are defined in `src/hono/app.ts` using Hono's router:

```typescript
import { Hono } from 'hono'

export const app = new Hono<{ Bindings: Env }>()

app.get('/', (c) => c.text('Hello World'))
```

### Dev Mode

Uses `wrangler dev --x-remote-bindings` to connect to remote Cloudflare resources during development.

---

## Do NOT

- ❌ Use `@tanstack/react-start` patterns — this is NOT a TanStack app
- ❌ Import React or UI components — this is API-only
- ❌ Use database transactions (Neon HTTP driver limitation)
- ❌ Forget to validate all inputs with Zod
