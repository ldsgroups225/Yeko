---
inclusion: always
description: Primary Source of Truth for Yeko SaaS.
---
# 📜 PROJECT CONSTITUTION: Yeko Elite EdTech

## 1. Vision & Architecture

- **Model:** Multi-tenant SaaS for French-speaking Africa.
- **Hierarchy:** Core (Global Templates) → School (Instances) → User (Role-based Access).
- **Core Principle:** "Confiance Absolue" (Absolute Trust). No code is committed without automated and agentic audit.

### Multi-Tenant Isolation

Every database query involving school-scoped data MUST include tenant filtering:

```typescript
where(eq(table.schoolId, ctx.schoolId))
```

Violating this rule causes cross-tenant data leakage and is a **critical security defect**.

## 2. Advanced Prompting Protocol

All agents MUST utilize **Plan-and-Execute** and **Chain-of-Thought (CoT)** reasoning.

1. **Decomposition:** Break tasks into atomic sub-tasks.
2. **Scratchpad:** Use internal reasoning before writing any final code.
3. **Least-to-Most:** Solve core logic (Database/Auth) before UI/UX.
4. **Codebase First:** Search existing patterns before creating new ones.

## 3. Technology Stack

- **Apps:** 4 apps (core, school, teacher, data-service) — all deploy to Cloudflare Workers.
- **Frontend:** TanStack Start (SSR) + TanStack Router (file-based routing), React 19, Tailwind CSS v4, Motion.
- **Data:** Drizzle ORM, PostgreSQL (Neon serverless), `@repo/data-ops` shared package.
- **Auth:** Better Auth (per-app cookie prefixes).
- **Payments:** Polar.sh.
- **UI:** shadcn/ui (New York style) via `@workspace/ui`.
- **Validation:** Zod schemas for all inputs.
- **Result type:** `@praha/byethrow` — lightweight, tree-shakable Result monad.
- **Logging:** `@repo/logger` (LogTape-based), with `tapLogErr` for ResultAsync chains.
- **Package Manager:** pnpm 10.x with catalog dependencies.

## 4. Internationalization (i18n)

- **Primary:** French (fr). **Secondary:** English (en).
- **Enforcement:** Hardcoded UI strings trigger immediate correction.
- **core/teacher:** typesafe-i18n (`LL.key()` pattern).
- **school:** i18next (`t('key')` pattern).

## 5. Data & Error Standards (Result-Oriented Framework)

- **Return Types:** All async data operations MUST return `ResultAsync<T, DatabaseError>`.
- **Error Handling:** NO-THROW POLICY. Catch all errors and wrap in `DatabaseError`.
- **Logging:** Use `tapLogErr` from `@repo/logger` in every `ResultAsync` chain.
- **Transactions:** AVOID Neon HTTP driver transactions — they throw "No transactions support" errors. Use sequential operations instead.
- **Consumption:** Server functions must check `.isFailure()` / `.isErr()` or use `.match()` / `.map()`.

## 6. Security Standards

- Every mutation requires an **active auth session**.
- All form inputs validated with **Zod**.
- No hardcoded secrets — use environment variables.
- No plain-text passwords — Better Auth handles hashing.
