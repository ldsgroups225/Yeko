# @repo/background-tasks — Agent Guide

> **Shared background task definitions** for Cloudflare Workers. Provides queue producer utilities, execution context management, and type definitions for background job dispatch.
> Source-only package — no build step. Consumed by `apps/school` and `packages/queue-worker`.

---

## Quick Reference

| Action     | Command          |
| ---------- | ---------------- |
| Typecheck  | `pnpm typecheck` |
| Lint + fix | `pnpm lint:fix`  |

---

## Directory Structure

```text
src/
├── index.ts               # Barrel export
├── types.ts               # Task payload type definitions
├── context.ts             # ExecutionContext management (setExecutionContext, getExecutionContext)
├── queue-producer.ts      # Queue message dispatcher (setQueueBinding, sendToQueue)
└── wait-until.ts          # waitUntil helper for background work in CF Workers
```

---

## Key Patterns

### Execution Context

CF Workers require an `ExecutionContext` for `waitUntil`. Set it per-request in the app's `server.ts`:

```typescript
import { setExecutionContext } from '@repo/background-tasks'

// In server.ts fetch handler
setExecutionContext(ctx)
```

### Queue Producer

Send messages to CF Queues for async processing:

```typescript
import { sendToQueue, setQueueBinding } from '@repo/background-tasks'

// Set the queue binding (once per request)
setQueueBinding(env.LOGS_QUEUE)

// Send a task
await sendToQueue({ type: 'LOG_EVENT', payload: { /* data */ } })
```

---

## Consumers

| Package                 | How It Uses This                                      |
| ----------------------- | ----------------------------------------------------- |
| `apps/school`           | Sets execution context + queue binding in `server.ts` |
| `packages/queue-worker` | Processes queued tasks (consumer side)                |

---

## Do NOT

- ❌ Add a build step — this is a source-only package
- ❌ Import app-specific code — keep task definitions generic
- ❌ Add heavy dependencies — only CF Workers types are needed
