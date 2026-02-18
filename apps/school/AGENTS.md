# Yeko School App — Agent Guide

> **School management dashboard** for administrators. Manages students, teachers, classes, attendance, grades, report cards, payments, timetables, and curriculum.
> Deployed to **Cloudflare Workers** via Wrangler. SSR powered by **TanStack Start**.

See @../../AGENTS.md for project-wide rules, security protocols, and the Result-oriented framework.
See @../../.kiro/steering/project_constitution.md for architectural decisions.
See @../../.kiro/steering/dev_coder_steering.md for coding standards.

---

## Quick Reference

| Action | Command |
| --- | --- |
| Dev server | `pnpm dev` (port 3001) |
| Build | `pnpm build` |
| Deploy | `pnpm deploy` |
| Typecheck | `pnpm typecheck` |
| Lint + fix | `pnpm lint:fix` |
| Unit tests | `pnpm test` |
| E2E (all) | `pnpm test:e2e` |
| E2E (UI mode) | `pnpm test:e2e:ui` |
| E2E (headed) | `pnpm test:e2e:headed` |
| E2E (debug) | `pnpm test:e2e:debug` |
| E2E (chromium) | `pnpm test:e2e:chromium` |
| E2E report | `pnpm test:e2e:report` |
| All tests | `pnpm test:all` |
| CF type gen | `pnpm cf-typegen` |

---

## Tech Stack

- **SSR Framework:** TanStack Start + TanStack Router (file-based routing)
- **UI:** React 19, shadcn/ui (`@workspace/ui`), Tailwind CSS v4, `motion/react`
- **State:** TanStack Query v5, TanStack Table (data tables)
- **Auth:** Better Auth (cookie prefix: `school`)
- **Data:** `@repo/data-ops` (Drizzle ORM, Neon serverless PostgreSQL)
- **i18n:** typesafe-i18n (base locale: `fr`, output: `src/i18n/`) + i18next for some views
- **Icons:** `@tabler/icons-react`
- **Charts:** Recharts
- **Validation:** Zod
- **Excel export:** `@chronicstone/typed-xlsx` + `xlsx`
- **Image cropping:** `react-image-crop`
- **Background tasks:** `@repo/background-tasks` (queue-based logging)
- **Storage:** R2 bucket for file uploads (student photos, documents)
- **Testing:** Vitest (JSDOM) + Playwright (E2E with full Chromium/WebKit/Firefox support)

---

## Directory Structure

```text
src/
├── server.ts              # CF Worker entry — inits DB, auth (cookiePrefix: 'school'), queue bindings
├── start.tsx              # TanStack Start config
├── router.tsx             # TanStack Router instance
├── routeTree.gen.ts       # ⚠️ AUTO-GENERATED — do not edit
├── styles.css             # Tailwind entry
│
├── routes/
│   ├── __root.tsx          # Root layout (meta, theme, i18n, devtools)
│   ├── index.tsx           # Landing / login page
│   ├── _auth.tsx           # Auth gate — redirects if no session
│   ├── reset-password.tsx  # Password reset flow
│   ├── api/                # API routes (auth handler)
│   └── _auth/              # Authenticated routes (~84 files)
│       ├── dashboard/      # Dashboard and analytics
│       ├── students/       # Student management
│       ├── teachers/       # Teacher management
│       ├── classes/        # Class management
│       ├── attendance/     # Attendance tracking
│       ├── grades/         # Grade management
│       ├── report-cards/   # Report card generation
│       ├── payments/       # Payment/fee management
│       ├── timetables/     # Timetable management
│       └── ...
│
├── school/
│   ├── functions/          # Server functions (~46 files, one per domain)
│   │   ├── students.ts
│   │   ├── teachers.ts
│   │   ├── classes.ts
│   │   ├── student-grades.ts
│   │   ├── student-attendance.ts
│   │   ├── payments.ts
│   │   ├── fee-calculation.ts
│   │   ├── report-cards.ts
│   │   ├── timetables.ts
│   │   ├── bulk-operations.ts
│   │   └── ...
│   ├── middleware/         # Auth + school context middleware
│   └── lib/                # School-specific utilities
│
├── components/             # UI components organized by feature (~183 files)
├── hooks/                  # Custom React hooks
├── schemas/                # Zod schemas for form validation (~36 files)
├── i18n/                   # typesafe-i18n translations
├── integrations/           # External service integrations
├── lib/                    # Utilities, query keys, helpers (~48 files)
├── __tests__/              # Test files
├── constants/              # App constants
└── utils/                  # General utility functions
```

---

## Critical Conventions

### Server Functions

All server functions live in `src/school/functions/` — organized by domain (one file per domain):

```typescript
export const createStudent = createServerFn()
  .inputValidator(createStudentSchema)
  .handler(async ({ data }) => {
    const ctx = await getSchoolContext()
    const result = await insertStudent({ ...data, schoolId: ctx.schoolId })
    if (R.isFailure(result)) {
      return { success: false, error: result.error.message }
    }
    return { success: true, data: result.value }
  })
```

### Auth & Context

- Cookie prefix: **`school`** (set in `server.ts`)
- Google OAuth + email/password enabled (with password reset support via email)
- Auth gate at `_auth.tsx` route layout
- School context from middleware provides `schoolId`, `schoolYearId`

### Background Tasks & Queues

This app integrates with `@repo/background-tasks` for:

- Queue-based logging via Cloudflare Queues
- `setExecutionContext(ctx)` for `waitUntil` support
- `setQueueBinding(env.LOGS_QUEUE)` for background log shipping

### R2 Storage

- R2 bucket configured in `wrangler.jsonc` for student photos and documents
- Binding: `STORAGE_BUCKET`

### i18n

- Primary library: **typesafe-i18n** (`LL.key()` pattern)
- Also uses **i18next** in some views (`t('key')` pattern)
- Base locale: `fr` (French)

### Vite SSR/Client Split

Same pattern as core — `vite.config.ts` contains `dataOpsBrowserGuard` and `stubServerModulesForClient` plugins. Never import `@repo/data-ops` server modules in client components.

---

## Do NOT

- ❌ Edit `routeTree.gen.ts` — auto-generated by TanStack Router
- ❌ Edit `i18n-types.ts` — auto-generated by typesafe-i18n
- ❌ Import `@repo/data-ops` server modules in client components
- ❌ Query without `schoolId` scoping — this is the most school-data-heavy app
- ❌ Use `domMax` from `motion/react` — use `domAnimation`
- ❌ Hardcode UI strings — use i18n functions
- ❌ Throw raw exceptions in server functions
- ❌ Use database transactions (Neon HTTP driver does not support them)
