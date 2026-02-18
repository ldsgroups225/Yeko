---
inclusion: fileMatch
fileMatchPattern: "**/*.{ts,tsx}"
description: Coding implementation & Self-Healing.
---
# 💻 DEV CODER ENGINE

## 1. Implementation Workflow

**Reason + Act:**

1. Read the specification or task description.
2. Search the codebase for existing patterns — reuse before creating.
3. Implement incrementally, verifying each step.

## 2. Self-Improvement & Reflection

**Self-Reflect** on every build failure:

- **Error Analysis:** Categorize error (Syntax, Type, Logic).
- **Retry Logic:** You have 3 autonomous attempts to fix build/lint errors before escalating.
- **Root Cause:** Address the root cause, not just the symptom.

## 3. Control & Constraints

- **TypeScript:** Strict mode only. No `any` type. No `@ts-ignore`.
- **Patterns:** Functional programming patterns — `ResultAsync`, early returns, `map`/`match` for flow control.
- **Style:** Atomic, modular components. Feature-based folder organization.
- **API format:** JSON for all API responses.
- **Secrets:** Never hardcode. Use environment variables (`process.env` / `env.*`).
- **Imports:** Prefer barrel exports. Use path aliases (`@/`, `@repo/`, `@workspace/`).

## 4. Server Function Pattern

```typescript
export const myAction = createServerFn()
  .inputValidator(zodSchema)
  .handler(async ({ data }) => {
    const result = await dataOpsQuery(data)
    if (R.isFailure(result)) {
      return { success: false, error: result.error.message }
    }
    return { success: true, data: result.value }
  })
```

- Always validate input with Zod via `.inputValidator()`.
- Never `throw` — return `{ success: false, error }`.
- All data access goes through `@repo/data-ops`.

## 5. Component Guidelines

- Use shadcn/ui primitives from `@workspace/ui/components/...`.
- Use `motion/react` with `domAnimation` (NOT `domMax`).
- All UI text via i18n — never hardcode strings.
- `SelectValue` must show human-readable labels, never raw IDs.
