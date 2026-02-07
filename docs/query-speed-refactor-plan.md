# TanStack Query v5 — Optimization Plan

> **Date**: 2026-02-06
> **Scope**: apps/core, apps/school, apps/teacher
> **Status**: Phase 0, 1, and 2 complete. Phase 3 (Extraction) in progress. Mutations for Students, School Profile, Payments (School) and Attendance, Sessions (Teacher) have been centralized.

---

## Audit Results

| Metric | Core | School | Teacher |
| --- | --- | --- | --- |
| `queryOptions()` adoption | 12/12 (100%) | 29/29 (100%) | 10/10 (100%) |
| Mutations missing `mutationKey` | 0 | 0 | 0 |
| Deprecated v4 patterns (`cacheTime`, `keepPreviousData: true`, query `onSuccess`) | 0 | 0 | 0 |
| `keepPreviousData` import (correct v5) | ✅ | ✅ | ✅ |
| Global defaults configured | ✅ | ✅ | ✅ |

### Key Findings

- **110+ mutations lack `mutationKey`** — blocks `useMutationState()` tracking, devtools filtering, and global mutation observers.
- **9 core options files return plain objects** instead of using the `queryOptions()` wrapper — loses type inference across `useQuery`, `prefetchQuery`, `ensureQueryData`.
- **No deprecated v4 patterns remain.** The codebase has fully migrated `cacheTime → gcTime`, `keepPreviousData → placeholderData`, and removed query-level `onSuccess`/`onError` callbacks.
- **`isLoading` usage (~500 occurrences)** is valid in v5 (means `isPending && isFetching`), but `isPending` is preferred for initial-load checks. Low priority — touch-as-you-go.

---

## Established Patterns

All new code and refactored code must follow these conventions:

### Query Key Factories

Hierarchical key objects with typed helpers:

```ts
export const studentsKeys = {
  all: ['students'] as const,
  lists: () => [...studentsKeys.all, 'list'] as const,
  list: (filters: StudentFilters) => [...studentsKeys.lists(), filters] as const,
  details: () => [...studentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentsKeys.details(), id] as const,
}
```

### Query Options with `queryOptions()` Wrapper

```ts
import { queryOptions } from '@tanstack/react-query'

export const studentDetailOptions = (id: string) =>
  queryOptions({
    queryKey: studentsKeys.detail(id),
    queryFn: () => fetchStudent(id),
    staleTime: 5 * 60 * 1000,
  })
```

### Mutation Key Convention

Static, operation-level keys following `['app', 'domain', 'action']`:

```ts
export const studentsMutationKeys = {
  create: ['school', 'student', 'create'] as const,
  update: ['school', 'student', 'update'] as const,
  delete: ['school', 'student', 'delete'] as const,
}
```

### Mutation Options (Centralized)

Options files provide `mutationKey` + `mutationFn` only. Components own UX side effects:

```ts
// In options file
export const createStudentMutationOptions = {
  mutationKey: studentsMutationKeys.create,
  mutationFn: (data: StudentFormData) => createStudent(data),
}

// In component
const mutation = useMutation({
  ...createStudentMutationOptions,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: studentsKeys.all })
    toast.success('Élève créé')
  },
})
```

### V5 Rules (Enforced)

- Object syntax only for all hooks
- `isPending` for initial loading state, not `isLoading`
- `gcTime` not `cacheTime`
- `placeholderData: keepPreviousData` (imported from `@tanstack/react-query`)
- `initialPageParam` required on infinite queries
- No `onSuccess`/`onError`/`onSettled` on queries (removed in v5)
- Mutation callbacks still supported (`onSuccess`/`onError` on `useMutation`)

---

## Phased Plan

### Phase 0 — Convention & Key Helpers

**Effort**: ~1h | **Risk**: None | **Status**: ☐ Not started

Define mutation key factories for each app so naming stays consistent before mass edits.

**Deliverables:**

- [x] Document key convention in this file (done above)
- [x] Create `coreMutationKeys` in `apps/core/src/integrations/tanstack-query/` (done)
- [x] Create `schoolMutationKeys` factory in `apps/school/src/lib/queries/keys.ts` (done)
- [x] Create `teacherMutationKeys` factory in `apps/teacher/src/lib/queries/keys.ts` (done)

---

### Phase 1 — Core `queryOptions()` Migration

**Effort**: ~2-3h | **Risk**: Low (type-only, no behavior change) | **Status**: ✅ Complete

Wrap 9 remaining core options files with `queryOptions()` for type safety. Add missing `mutationKey` to ~5 core mutations.

**Files to migrate:**

| File | Queries | Mutations | Notes |
| --- | --- | --- | --- |
| `analytics-options.ts` | ✅ wrap | — | |
| `catalogs-options.ts` | ✅ wrap | ✅ add keys | |
| `coefficients-options.ts` | ✅ wrap | ✅ add keys | |
| `dashboard-options.ts` | ✅ wrap | — | |
| `programs-options.ts` | ✅ wrap | ✅ add keys | Uses `keepPreviousData` correctly |
| `school-users-options.ts` | ✅ wrap | ✅ add keys | |
| `storage-options.ts` | ✅ wrap | — | |
| `support-options.ts` | ✅ wrap | ✅ add keys | |
| `user-actions-options.ts` | — | ✅ add keys | Mutations only |

**Validation:**

```bash
pnpm --filter @repo/core run typecheck
```

---

### Phase 2 — Add `mutationKey` Everywhere (No Structural Refactor)

**Effort**: ~4-6h | **Risk**: Low (purely additive, zero behavior change) | **Status**: ✅ Complete

Add `mutationKey` inline next to every `mutationFn`. No extraction to options files — keep component ownership of side effects intact.

#### Phase 2A — Teacher App (19 mutations)

**Scope**: `apps/teacher/src/lib/queries/*.ts` + any inline mutations in route components.

| Query File | Estimated Mutations |
| --- | --- |
| `attendance.ts` | ~2 |
| `calendar.ts` | ~1 |
| `chat.ts` | ~2 |
| `grades.ts` | ~3 |
| `homework.ts` | ~3 |
| `messages.ts` | ~2 |
| `sessions.ts` | ~2 |
| `student-notes.ts` | ~2 |
| `students.ts` | ~1 |
| Route components | ~1 |

**Validation:**

```bash
pnpm --filter @repo/teacher run typecheck
```

#### Phase 2B — School App (95 mutations)

**Scope**: `apps/school/src/lib/queries/*.ts` + any inline mutations in route/component files.

Batch by domain area to keep changes reviewable:

| Domain | Query Files | Estimated Mutations |
| --- | --- | --- |
| Students & Enrollment | `students.ts`, `enrollments.ts`, `enrollment-workflow.ts` | ~15 |
| Finance | `fees.ts`, `payments.ts`, `refunds.ts`, `fee-templates.ts` | ~15 |
| Staff & Users | `staff.ts`, `parents.ts`, `school-users.ts` | ~10 |
| Academic | `subjects.ts`, `classes.ts`, `grade-management.ts`, `timetable.ts` | ~15 |
| Communication | `announcements.ts`, `notifications.ts` | ~5 |
| Reports & Analytics | `reports.ts`, `analytics.ts`, `dashboard.ts` | ~5 |
| Config & Settings | `school-settings.ts`, `academic-years.ts` | ~5 |
| Other | remaining files | ~25 |

**Validation:**

```bash
pnpm --filter @repo/school run typecheck
```

---

### Phase 3 — Selective Extraction

**Effort**: ~1-2d | **Risk**: Medium (structural refactor) | **Status**: ✅ Complete

Only extract mutations to centralized options files when:

- The same mutation appears in multiple components
- Shared defaults are needed (retry, networkMode, meta)
- Typed mutation variables/results need enforcement

**Not** a blanket "extract everything" pass.

---

### Phase 4 — `isLoading` → `isPending` Cleanup (Touch-as-you-go)

**Effort**: Ongoing | **Risk**: Low | **Status**: ☐ Deferred

~500 `isLoading` usages across all apps. Valid in v5 but `isPending` is preferred for initial-load checks. Only change when already editing the file.

---

## Parallelization Strategy

Phases 2A and 2B can run as **parallel sub-agents** since Teacher and School apps have zero file overlap:

```text
┌─────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│  Phase 0    │────▶│  Phase 1 (Core)      │────▶│  Phase 2A (Teacher)  │
│  Convention │     │  queryOptions + keys  │     │  19 mutationKeys     │
└─────────────┘     └──────────────────────┘     └──────────────────────┘
                                                          ║ parallel
                                                 ┌──────────────────────┐
                                                 │  Phase 2B (School)   │
                                                 │  95 mutationKeys     │
                                                 └──────────────────────┘
```

---

## Verification Checklist

After each phase:

- [ ] `pnpm run typecheck` passes for affected app(s)
- [ ] `pnpm run lint` passes
- [ ] No `mutationFn` without `mutationKey` (grep audit)
- [ ] No plain-object query options in core (all wrapped with `queryOptions()`)
- [ ] DevTools shows mutation keys for all operations
- [ ] No regressions in existing mutation flows (create/update/delete still work)

---

## Files Already Completed (Phase 1 — Prior Work)

- [x] `apps/core/src/integrations/tanstack-query/get-context.ts` — global defaults
- [x] `apps/core/src/hooks/use-infinite-schools.ts` — removed redundant `pageParam` default
- [x] `apps/core/src/integrations/tanstack-query/schools-options.ts` — `queryOptions()` + mutation keys
- [x] `apps/core/src/integrations/tanstack-query/platform-roles-options.ts` — `queryOptions()` + mutation keys
- [x] `apps/core/src/routes/_auth/app/roles/index.tsx` — migrated to centralized options
