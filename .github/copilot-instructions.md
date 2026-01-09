# GitHub Copilot Instructions

## Project Overview

This is a monorepo SaaS application built with **Cloudflare Workers**, **TanStack Start**, and **Drizzle ORM**.

- **Package Manager**: `pnpm`
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: Better Auth
- **Styling**: Tailwind CSS v4

## Repository Structure

- `apps/user-application`: Frontend/Fullstack app (TanStack Start, React 19, Vite).
- `apps/data-service`: Backend API Worker (Hono).
- `packages/data-ops`: Shared library for Database (Drizzle) and Authentication (Better Auth).
- `packages/ui`: Shared UI/component library (Base UI + Tailwind v4) consumed by apps.
- `packages/typescript-config`: Shared TS config presets (apps/packages extend these).

## Critical Developer Workflows

### 1. Setup & Development

- **Initial Setup**: `pnpm run setup` (Installs deps & builds `data-ops`).
- **Start User App**: `pnpm run dev:user-application` (Runs on port 3000).
- **Start Data Service**: `pnpm run dev:data-service`.
- **Rebuild Shared Lib**: `pnpm run build:data-ops` (Run this after changing `packages/data-ops`).

### 1.1 Linting & Typechecking

- **Lint UI package**: `pnpm --filter @workspace/ui lint`
- **Typecheck (any package/app)**: prefer `pnpm -C <dir> tsc --noEmit` when debugging TS issues.

### 2. Database & Authentication (Cloudflare D1)

The `data-ops` package manages the database schema and auth configuration.

- **Generate Auth Schema**: `pnpm run --filter data-ops better-auth:generate`
- **Generate SQL Migrations**: `pnpm run --filter data-ops drizzle:generate`
- **Apply Migrations (Local)**: `npx wrangler d1 execute DB --local --file=../../packages/data-ops/src/drizzle/<migration_file>.sql` (from `apps/user-application`)
- **Apply Migrations (Remote)**: `pnpm run --filter data-ops drizzle:migrate`

### 3. Type Generation

- **Generate Worker Types**: `pnpm run --filter user-application cf-typegen`
  - Updates `worker-configuration.d.ts` based on `wrangler.jsonc`.
  - Run this after modifying bindings or environment variables.
- **Generate Data Service Worker Types**: `pnpm run --filter data-service cf-typegen`

## Architecture & Patterns

### Environment Variables & Bindings

- **Pattern**: Use `import { env } from "cloudflare:workers"` to access bindings globally.
- **Local Secrets**: Store in `apps/user-application/.dev.vars`.
- **Drizzle Kit Secrets**: Store in `packages/data-ops/.env` (for schema generation only).
- **Wrangler Config**: Defined in `wrangler.jsonc` (supports comments).

### Shared Data Operations (`packages/data-ops`)

- Centralizes all DB schemas (`src/drizzle/auth-schema.ts`) and setup (`src/database/setup.ts`).
- Exports helper functions like `initDatabase` and `setAuth`.
- **Rule**: Do not define DB schemas in apps; always define in `data-ops` and import.

### Shared TypeScript Configs (`packages/typescript-config`)

- Apps and packages generally extend `@workspace/typescript-config/vite-react-library.json`.
- When TS settings must change, prefer changing the shared preset rather than diverging per-package.

### User Application (`apps/user-application`)

- **Framework**: TanStack Start (SSR, File-based routing).
- **Entry Point**: `src/server.ts` (Custom Cloudflare Worker entry).
- **Routing**: `src/routes/` (Auto-generated `routeTree.gen.ts`).
- **Styling**: Tailwind v4 (no `tailwind.config.js`, uses CSS variables).

### UI Package (`packages/ui`)

- Components live in `packages/ui/src/components` and are consumed via `@workspace/ui/components/*`.
- Prefer Base UI composition patterns (e.g., `render` props) over `asChild`-style APIs.
- Keep UI exports stable and consistent with the `exports` map in `packages/ui/package.json`.

## Task Management (Mandatory)

This project uses **bd** (beads) for issue tracking.
Run `bd prime` for full workflow context, or `bd hooks install` for auto-injection.

### 🚨 SESSION CLOSE PROTOCOL 🚨

**CRITICAL**: Before saying "done" or "complete", you MUST run this checklist:

```bash
[ ] 1. git status              # check what changed
[ ] 2. git add <files>         # stage code changes
[ ] 3. bd sync                 # commit beads changes
[ ] 4. git commit -m "..."     # commit code
[ ] 5. bd sync                 # commit any new beads changes
[ ] 6. git push                # push to remote
```

**NEVER skip this.** Work is not done until pushed.

### Essential Commands

**Finding Work:**
- `bd ready` - Show issues ready to work (no blockers)
- `bd list --status=open` - All open issues
- `bd show <id>` - Detailed issue view with dependencies

**Creating & Updating:**
- `bd create --title="..." --type=task|bug|feature --priority=2` - New issue
  - Priority: 0-4 (0=critical, 2=medium, 4=backlog)
- `bd update <id> --status in_progress` - Claim work
- `bd close <id>` - Mark complete
- `bd close <id> --reason="explanation"` - Close with reason

**Sync & Collaboration:**
- `bd sync` - Sync with git remote (run at session end)
- `bd sync --status` - Check sync status

### Common Workflows

**Starting work:**
```bash
bd ready                                  # Find available work
bd show <id>                              # Review issue details
bd update <id> --status in_progress       # Claim it
```

**Completing work:**
```bash
bd close <id>      # Close completed issue
bd sync            # Push to remote
git push           # Ensure changes are pushed
```

## Coding Standards

- **TypeScript**: Strict mode enabled. Use `import type` for type-only imports.
- **React**: Use Functional Components with Hooks.
- **Imports**: Use `@/*` aliases for `src/*` in apps; use `@workspace/ui/*` for shared UI imports.
- **Files**: Kebab-case for filenames (e.g., `user-profile.tsx`).
