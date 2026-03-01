# TS2742 `authServerFn` Typing Troubleshooting (TanStack Start)

## Why this doc exists

In `apps/school`, we hit a TypeScript regression while improving type safety in `authServerFn`:

- We removed an unsafe `as any` cast (good).
- Then TypeScript started reporting:
  - `TS2742` (non-portable inferred type in exported symbol)
  - Cascading `context` inference breakages (`context` became `never`) in many server functions.

This guide explains **what happened**, **how to fix it safely**, and **how to avoid reintroducing the issue**.

---

## Symptoms you may see

### 1) TS2742 on exported builder/function
Typical error:

- `The inferred type of 'authServerFn' cannot be named without a reference to ... @tanstack/start-client-core/... This is likely not portable. A type annotation is necessary.`

This usually appears on exported values that infer complex generic types through pnpm store paths.

### 2) Massive downstream errors in server handlers
Examples:

- `Property 'school' does not exist on type 'never'`
- `Property 'schoolYearId' does not exist on type 'never'`

These often appear in many files under `apps/school/src/school/functions/**`, especially inside:

- `.handler(async ({ context }) => { ... })`

When this happens, middleware context typing was lost.

---

## Root cause

`authServerFn` is a TanStack Start server function builder with middleware-injected context.

If its exported type is:
- too implicit (TS2742 portability issue), or
- annotated too broadly / incorrectly,

TypeScript may fail to carry the middleware context through `.inputValidator(...).handler(...)`, and `context` can collapse to `never`.

So this is not a runtime bug; it is a **type-export + generic inference boundary bug**.

---

## The safe fix pattern

Use a **stable local builder** and derive the exported type from the builder’s `middleware` with the middleware tuple generic explicitly provided.

### Working implementation

```Yeko/apps/school/src/school/lib/server-fn.ts#L1-80
import type { TranslationFunctions } from '../../i18n/i18n-types'
import { DatabaseError } from '@repo/data-ops/errors'
import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { getServerTranslations } from '../../lib/i18n-server'
import { getAuthContext } from '../middleware/auth'
import { getSchoolContext, getSchoolYearContext } from '../middleware/school-context'

export { createServerFn } from '@tanstack/react-start'

export interface ServerContext {
  auth: { userId: string, email: string, name: string }
  school: { schoolId: string, userId: string } | null
  schoolYear: { schoolYearId: string, schoolId: string } | null
  t: TranslationFunctions
}

const authenticatedMiddleware = createMiddleware().server(async ({ next }) => {
  const auth = await getAuthContext()
  const t = getServerTranslations('fr')

  if (!auth) {
    throw new DatabaseError('UNAUTHORIZED', t.errors.unauthorized())
  }

  const school = await getSchoolContext().catch(() => null)
  const schoolYear = await getSchoolYearContext().catch(() => null)

  return next({
    context: {
      auth,
      school,
      schoolYear,
      t,
    },
  })
})

const authServerBuilder = createServerFn({
  method: 'POST' as const,
})

type AuthServerFn = ReturnType<typeof authServerBuilder.middleware<[typeof authenticatedMiddleware]>>

export const authServerFn: AuthServerFn = authServerBuilder.middleware([authenticatedMiddleware])
```

---

## Why this works

1. **Portable annotation boundary**
   `AuthServerFn` is derived from local symbols, avoiding problematic inferred export signatures that trigger TS2742.

2. **Middleware context is preserved**
   Using:
   - `middleware<[typeof authenticatedMiddleware]>`
   ensures TypeScript captures the concrete middleware tuple and propagates its `context` shape.

3. **No `any` fallback**
   We keep strict typing and avoid silent regressions.

---

## What *not* to do

### ❌ Reintroduce `as any`
Example to avoid:

- `export const authServerFn = createServerFn().middleware([authenticatedMiddleware]) as any`

This hides real type issues and leaks `unknown/any` to call sites.

### ❌ Annotate with overly broad `ReturnType<typeof createServerFn<...>>`
This may compile but can break context propagation in handlers (`context` => `never`).

### ❌ Add random `@ts-expect-error` for TS2742
It can become unused or hide the wrong issue. Prefer correct typing structure.

---

## Verification checklist

After touching `server-fn.ts`:

1. Run typecheck:
   - `nr typecheck`
2. Confirm:
   - No `TS2742` in `server-fn.ts`
   - No cascading `context ... type 'never'` in `apps/school/src/school/functions/**`
3. Spot-check one file using `authServerFn.handler(...)` to ensure `context.school` is strongly typed.

---

## Practical debugging strategy if this returns

1. Start from the first `TS2742` line.
2. Fix exported type boundary in `server-fn.ts`.
3. Re-run typecheck and confirm whether `context: never` cascade disappears.
4. If context still breaks:
   - Inspect `authServerFn` annotation first.
   - Ensure middleware tuple generic is explicitly instantiated.

---

## Team note

This class of issue appears when combining:
- strict TS settings,
- exported inferred generics,
- middleware-heavy typed builders,
- pnpm path-based dependency layout.

It is subtle and easy to reintroduce during refactors.
If you update TanStack Start or TS versions, quickly re-run this checklist.
