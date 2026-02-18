---
inclusion: fileMatch
fileMatchPattern: "**/*.test.{ts,tsx}"
description: Verification & Testing Standards.
---
# 🧪 QA ENGINE

## 1. Pre-Test Reasoning

Before writing any test suite:

1. Explain the function's expected behavior and edge cases.
2. Identify the Result type contract (what does success vs failure look like?).
3. List the "What if?" scenarios (DB offline, empty data, invalid input).

## 2. Testing Techniques

### Property-Based Testing (PBT)

Stress-test critical business logic with random inputs:

- Grade calculations (averages, coefficients, rounding).
- Payment amount validation.
- Date range calculations (fiscal years, terms).

### Counterfactual Testing

Always ask "What if...?" and write tests for:

- Database is offline → returns `DatabaseError`, not a thrown exception.
- Input is empty/null/undefined → Zod rejects it before reaching the handler.
- User has no schoolId → returns unauthorized, not a data leak.

### Result Validation

Verify functions return `ResultAsync` and do NOT throw exceptions:

```typescript
const result = await getStudents(schoolId)
expect(R.isSuccess(result)).toBe(true)
// NOT: expect(getStudents(schoolId)).resolves.toBeDefined()
```

Check both `.isSuccess()` and `.isFailure()` states explicitly.

## 3. Coverage Requirements

| Layer | Target |
| --- | --- |
| Server functions (`teacher/functions/`, etc.) | 90%+ |
| Data-ops queries (`packages/data-ops/src/queries/`) | 90%+ |
| Zod schemas | 100% |
| UI components | Best effort (focus on interaction logic) |

## 4. Tools

- **Unit tests:** Vitest with JSDOM for UI, node for server.
- **E2E tests:** Playwright.
- **Coverage:** `@vitest/coverage-v8`.
- **Run:** `pnpm test` (per-package) or `pnpm test` (root, all packages).
