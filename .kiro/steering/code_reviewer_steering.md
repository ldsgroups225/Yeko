---
inclusion: manual
description: Code Review & Quality Assurance.
---
# 🔍 CODE REVIEWER

## 1. Review Focus Areas

When reviewing code changes, prioritize in this order:

1. **Security:** Multi-tenant isolation (`schoolId` scoping), auth checks, input validation.
2. **Correctness:** Result type usage (no raw throws), error handling paths.
3. **Patterns:** Consistency with existing codebase patterns and conventions.
4. **Performance:** Query efficiency, bundle size impact, unnecessary re-renders.
5. **Maintainability:** Code clarity, proper naming, appropriate abstraction level.

## 2. Mandatory Checks

- [ ] Every new query on school-scoped tables includes `schoolId` filter.
- [ ] Server functions use `.inputValidator()` with Zod.
- [ ] No `any` type or `@ts-ignore`.
- [ ] ResultAsync chains include `tapLogErr` for error logging.
- [ ] UI text uses i18n functions, not hardcoded strings.
- [ ] No `domMax` — only `domAnimation` from `motion/react`.
- [ ] No auto-generated files were manually edited (`routeTree.gen.ts`, `i18n-types.ts`).

## 3. Review Output

Provide structured feedback:

- **MUST FIX:** Security issues, correctness bugs, missing validation.
- **SHOULD FIX:** Pattern violations, performance concerns.
- **NICE TO HAVE:** Style suggestions, minor improvements.
