# Yeko — Monorepo Agent Guide

> **Multi-tenant EdTech SaaS** for French-speaking Africa.
> Manages schools, teachers, students, grades, payments, and parent communication.

See @.kiro/steering/project_constitution.md for the full project constitution.

---

## 1. Monorepo Overview

| Layer | Package | Name | Port | Deploy Target |
| --- | --- | --- | --- | --- |
| **Apps** | `apps/core` | `yeko-core` | 3000 | Cloudflare Workers |
| | `apps/school` | `yeko-school` | 3001 | Cloudflare Workers |
| | `apps/teacher` | `yeko-teacher` | 3002 | Cloudflare Workers |
| | `apps/data-service` | `data-service` | 8787 | Cloudflare Workers |
| **Packages** | `packages/data-ops` | `@repo/data-ops` | — | Built with `tsc` |
| | `packages/ui` | `@workspace/ui` | — | Source-only |
| | `packages/logger` | `@repo/logger` | — | Built with `tsup` |
| | `packages/eslint-config` | `@yeko/eslint-config` | — | Config |
| | `packages/typescript-config` | `@workspace/typescript-config` | — | Config |
| | `packages/background-tasks` | — | — | Shared task definitions |
| | `packages/queue-worker` | `@repo/queue-worker` | — | Cloudflare Workers |

**Package manager:** pnpm `10.28.2` with catalog dependencies (see `pnpm-workspace.yaml`).

### Subtree Agent Files

Each app and package has its own `AGENTS.md` with specific commands, directory structure, and conventions:

**Apps:**

- See @apps/core/AGENTS.md for the Core admin dashboard.
- See @apps/school/AGENTS.md for the School management app.
- See @apps/teacher/AGENTS.md for the Teacher dashboard.
- See @apps/data-service/AGENTS.md for the Data Service API.

**Packages:**

- See @packages/data-ops/AGENTS.md for the shared data layer.
- See @packages/ui/AGENTS.md for the shared UI library.
- See @packages/logger/AGENTS.md for the structured logging package.
- See @packages/eslint-config/AGENTS.md for the shared ESLint config.
- See @packages/typescript-config/AGENTS.md for the shared TSConfig bases.
- See @packages/background-tasks/AGENTS.md for background task definitions.
- See @packages/queue-worker/AGENTS.md for the CF Queue consumer worker.

---

## 2. Quick Reference — Commands

### Monorepo-level (run from root)

| Action | Command |
| --- | --- |
| First-time setup | `pnpm setup` |
| Build data-ops | `pnpm build:data-ops` |
| Build logger | `pnpm build:logger` |
| Typecheck all | `pnpm typecheck` |
| Lint all | `pnpm lint` |
| Test all | `pnpm test` |

### Per-app (run from root)

| Action | Command |
| --- | --- |
| Dev core | `pnpm dev:yeko-core` |
| Dev school | `pnpm dev:yeko-school` |
| Dev teacher | `pnpm dev:yeko-teacher` |
| Dev data-service | `pnpm dev:data-service` |
| Deploy core | `pnpm deploy:yeko-core` |
| Deploy school | `pnpm deploy:yeko-school` |
| Deploy teacher | `pnpm deploy:yeko-teacher` |
| Deploy data-service | `pnpm deploy:data-service` |

### Docker (via Makefile)

| Action | Command |
| --- | --- |
| Start all (dev) | `make docker-up` |
| Stop all | `make docker-down` |
| Rebuild all | `make docker-rebuild` |
| Start single app | `make core-up` / `make school-up` / `make teacher-up` |
| Shell into container | `make shell-core` / `make shell-teacher` |

### data-ops (run from `packages/data-ops/`)

| Action | Command |
| --- | --- |
| Generate Drizzle migrations | `pnpm drizzle:generate` |
| Run migrations | `pnpm drizzle:migrate` |
| Pull schema from DB | `pnpm drizzle:pull` |
| Drizzle Studio | `pnpm studio` |
| Seed database | `pnpm seed` |
| Seed (fresh) | `pnpm seed:fresh` |
| Reset database | `pnpm reset:db` |
| Generate Better Auth schema | `pnpm better-auth:generate` |

---

## 3. Tech Stack

- **Frontend:** TanStack Start (SSR) + TanStack Router (file-based), React 19, Tailwind CSS v4, `motion/react`
- **UI library:** shadcn/ui (New York style) via `@workspace/ui`, Base UI
- **State:** TanStack Query v5 (server state), PGlite (offline client DB in teacher app)
- **Auth:** Better Auth (per-app cookie prefixes: `core`, `school`, `teacher`)
- **Database:** PostgreSQL on Neon (serverless), Drizzle ORM
- **Payments:** Polar.sh
- **Validation:** Zod schemas everywhere
- **i18n:** typesafe-i18n (core/teacher), i18next (school)
- **Icons:** `@tabler/icons-react`
- **Logging:** `@repo/logger` (LogTape-based)
- **Result type:** `@praha/byethrow` — lightweight Result monad
- **Deploy:** Cloudflare Workers via Wrangler
- **Git hooks:** Lefthook (pre-commit: lint + typecheck, pre-push: full checks)

---

## 4. Architecture Principles

> Source: @.kiro/steering/project_constitution.md

### Multi-Tenant Hierarchy

```text
Core (Global Templates) → School (Instances) → User (Role-based Access)
```

### Reasoning Protocol

All agents MUST use **Plan-and-Execute** with **Chain-of-Thought** reasoning:

1. **Decompose** the task into atomic sub-tasks.
2. **Research** the codebase for existing patterns before writing anything.
3. **Solve core logic** (Database → Auth → Server Functions) before UI.

---

## 5. Result-Oriented Framework (No-Throw Policy)

> Source: @.kiro/steering/project_constitution.md §5

The `@repo/data-ops` layer enforces a **strict No-Throw Policy**.

```typescript
import { Result as R } from '@praha/byethrow'
import { tapLogErr } from '@repo/logger'

// ✅ Correct — returns ResultAsync, logs errors
export async function getStudents(schoolId: string) {
  return getStudentsBySchool(schoolId)
    .mapErr(tapLogErr(databaseLogger, 'getStudents'))
}

// ✅ Correct — consumer checks result
const result = await getStudents(schoolId)
if (R.isFailure(result)) {
  return { success: false, error: result.error.message }
}
return { success: true, data: result.value }
```

### Rules

- **Return types:** All async data operations MUST return `ResultAsync<T, DatabaseError>`.
- **No `throw`:** Catch all errors and wrap them in `DatabaseError`.
- **Logging:** Every `ResultAsync` chain MUST attach `.mapErr(tapLogErr(logger, context))`.
- **Consumption:** Server functions must check `.isErr()` / `.isFailure()` or use `.match()` / `.map()`.

---

## 6. Security Protocols

> Source: @.kiro/steering/security_auditor_steering.md

### Multi-Tenant Isolation (CRITICAL)

Every database query involving school-scoped data **MUST** include tenant filtering:

```typescript
// ✅ Always scope by schoolId
where(eq(table.schoolId, ctx.schoolId))
```

### Security Checklist

- ✅ All form inputs validated with **Zod schemas**.
- ✅ Every mutation requires an **active session** (Better Auth).
- ✅ **No hardcoded secrets** — use environment variables (`process.env` / `env.*`).
- ✅ No plain-text passwords — Better Auth handles hashing.
- ✅ XSS prevention via Zod input sanitization.

---

## 7. Database Protocols

### Neon HTTP Driver Limitations

- ❌ **No transactions** with `neon-http` driver — it throws `"No transactions support in neon-http driver"`.
- ✅ Use **sequential database operations** instead.
- ✅ For batch operations, prepare data in memory first, then execute individual queries.

### Driver Detection

The project auto-selects the driver:

- URLs with `.neon.tech` or `sslmode=` → `neon-http` (serverless)
- Other URLs → standard `pg` driver

### Drizzle ORM

- Schema definitions in `packages/data-ops/src/drizzle/`.
- Migrations in `packages/data-ops/drizzle/` (generated by `drizzle-kit`).
- Seed data in `packages/data-ops/src/seed/`.
- Query functions in `packages/data-ops/src/queries/`.

---

## 8. Coding Standards

> Source: @.kiro/steering/dev_coder_steering.md

### TypeScript

- **Strict mode** always — no `any` type.
- Early returns and functional patterns.
- Use `ResultAsync` / `Result` for flow control, not try-catch-throw.

### Formatting & Style

- ESLint via `@yeko/eslint-config` (shared config).
- Atomic, modular components.
- API responses must be JSON.

### Self-Healing Protocol

On build/lint failure:

1. Categorize: Syntax, Type, or Logic error.
2. Attempt up to **3 autonomous fix cycles** before asking the user.

---

## 9. Internationalization (i18n)

- **Primary locale:** French (`fr`). **Secondary:** English (`en`).
- **All UI text** must use i18n functions — **never** hardcode French strings in JSX.
- `core` & `teacher` apps use **typesafe-i18n** (`LL.key()` pattern).
- `school` app uses **i18next** (`t('key')` pattern).
- Hardcoded UI strings trigger **immediate correction**.

---

## 10. UI/UX Standards

### Select Components

`SelectTrigger` MUST display the **human-readable label** of the selected item, never the internal ID:

```tsx
// ✅ Correct
<SelectValue>{items.find(i => i.id === value)?.name}</SelectValue>

// ❌ Wrong
<SelectValue />
```

### Animation

- Use `motion/react` with `domAnimation` feature bundle (NOT `domMax`) for smaller bundles.
- Wrap in `<LazyMotion features={domAnimation}>`.

### Vite & SSR

- Include legacy CommonJS modules and TanStack libs in `ssr.noExternal` and `optimizeDeps.include` to prevent "No matching export" and duplicate context errors.

---

## 11. Shared Packages Reference

### `@repo/data-ops`

Central data layer: auth, database, Drizzle schemas, queries, Zod schemas, S3 storage.

| Export Path | Purpose |
| --- | --- |
| `@repo/data-ops` | Main index (server) / browser index (client) |
| `@repo/data-ops/auth/server` | Better Auth instance (server) |
| `@repo/data-ops/auth/setup` | Auth configuration |
| `@repo/data-ops/database/*` | DB initialization |
| `@repo/data-ops/queries/*` | Domain query modules |
| `@repo/data-ops/drizzle/*` | Drizzle schema tables |
| `@repo/data-ops/zod-schema/*` | Shared Zod schemas |
| `@repo/data-ops/errors` | `DatabaseError` type |
| `@repo/data-ops/storage` | S3-compatible file storage |

⚠️ **SSR/Client split:** Apps use Vite plugins to redirect `@repo/data-ops` to `index.browser.ts` on client builds. Never import server-only modules in client components.

### `@workspace/ui`

Shared shadcn/ui component library. Import as:

```typescript
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
```

### `@repo/logger`

Structured logging built on LogTape. Exports `tapLogErr` for Result chain error logging.

---

## 12. Testing Strategy

> Source: @.kiro/steering/qa_steering.md

### Techniques

- **Property-Based Testing (PBT):** Stress-test critical business logic (grades, payments) with random inputs.
- **Counterfactual Testing:** Always ask "What if the database is offline?" and test error handling paths.
- **Result Validation:** Verify functions return `ResultAsync` and do NOT throw. Check `.isOk()` / `.isErr()` explicitly.

### Coverage Targets

- **90%+** for server functions and data-ops queries.
- **100%** for Zod schemas.

### Tools

- **Unit tests:** Vitest (JSDOM for UI, node for server).
- **E2E tests:** Playwright.
- **Coverage:** `@vitest/coverage-v8`.

---

## 13. Git Workflow

### Hooks (Lefthook)

| Hook | What it does |
| --- | --- |
| `pre-commit` | ESLint (fix) + TypeScript check on staged files (parallel, per-package) |
| `pre-push` | Full lint + full typecheck across all packages |
| `post-merge` | Auto `pnpm install` if `package.json` or lockfile changed |
| `post-checkout` | Auto `pnpm install` if `node_modules` missing |

### Feature Planning Templates

- PRD template: `agent-template/create-prd.md`
- Task generation: `agent-template/generate-tasks.md`

---

## 14. Do NOT

- ❌ Use `any` type in TypeScript — strict mode enforced.
- ❌ Throw raw exceptions in data-ops — use `ResultAsync` + `DatabaseError`.
- ❌ Use transactions with neon-http driver — not supported.
- ❌ Query school-scoped data without `schoolId` filter — multi-tenant leakage.
- ❌ Hardcode UI strings — use i18n functions.
- ❌ Hardcode secrets — use environment variables.
- ❌ Import `@repo/data-ops` server modules in client-side code.
- ❌ Use `domMax` from `motion/react` — use `domAnimation` for bundle size.
- ❌ Skip Zod validation on server function inputs.
- ❌ Allow database mutations without an active auth session.
- ❌ Edit auto-generated files (`routeTree.gen.ts`, `i18n-types.ts`).

---

## 15. Steering Files Reference

Detailed role-specific protocols live in `.kiro/steering/`:

| File | Purpose | When Applied |
| --- | --- | --- |
| @.kiro/steering/project_constitution.md | Architecture, vision, stack, error standards | Always |
| @.kiro/steering/dev_coder_steering.md | Coding implementation, self-healing | When editing `.ts`/`.tsx` |
| @.kiro/steering/security_auditor_steering.md | Zero-trust security, red-team checks | Manual / security reviews |
| @.kiro/steering/architect_steering.md | System design, EARS requirements, ToT | Architectural planning |
| @.kiro/steering/qa_steering.md | Testing techniques, PBT, coverage | When editing `.test.ts` |
| @.kiro/steering/code_reviewer_steering.md | Documentation retrieval, context optimization | Manual |
| @.kiro/steering/user_proxy_steering.md | Behavioral UX testing, persona simulation | Manual |

---

## 16. Directory Structure (Top-Level)

```text
.
├── apps/
│   ├── core/              # Admin dashboard (Next.js-like via TanStack Start)
│   ├── school/            # School management app
│   ├── teacher/           # Teacher mobile PWA (see apps/teacher/AGENTS.md)
│   └── data-service/      # API data service (Hono on CF Workers)
│
├── packages/
│   ├── data-ops/          # Shared data layer (Drizzle, auth, queries, storage)
│   ├── ui/                # Shared shadcn/ui components
│   ├── logger/            # Structured logging (LogTape)
│   ├── eslint-config/     # Shared ESLint config
│   ├── typescript-config/ # Shared TSConfig bases
│   ├── background-tasks/  # Shared background task definitions
│   └── queue-worker/      # CF Worker queue consumer
│
├── docs/                  # Project documentation & reports
├── agent-template/        # PRD & task generation templates
├── tasks/                 # Task tracking files
├── scripts/               # Utility scripts
│
├── pnpm-workspace.yaml    # Workspace + dependency catalog
├── lefthook.yml           # Git hooks config
├── Makefile               # Docker shortcuts
├── docker-compose.yml     # Dev Docker environment
└── docker-compose.prod.yml
```
