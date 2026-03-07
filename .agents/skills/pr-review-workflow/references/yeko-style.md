# Yeko PR Review Style Guide

This reference exists to help PR triage agents judge code against the actual repository, not a generic TypeScript project.

## Repository Facts

- Base branch: `master`
- Package manager: `pnpm`
- Architecture: monorepo with apps plus shared packages
- Main frontend stack: TanStack Start, TanStack Router, React 19, Tailwind CSS v4
- Server/data layer: Drizzle, Better Auth, Neon, Cloudflare Workers

## Non-negotiable rules

### Data and security

- School-scoped queries must include tenant filtering by `schoolId`.
- Never accept hardcoded secrets.
- Mutations must require an active authenticated context.
- Zod validation is mandatory for server inputs.

### `packages/data-ops`

- No raw throws.
- Async operations should return `ResultAsync<T, DatabaseError>`.
- Error paths should attach logger mapping such as `tapLogErr(...)`.

### Frontend

- No hardcoded UI strings in app code.
- `core` and `teacher` use `typesafe-i18n`.
- `school` uses `i18next`.
- `SelectTrigger` must show the selected label, not the raw ID.
- For `motion/react`, prefer `domAnimation`.

### Generated files

Never approve or produce manual edits to:

- `routeTree.gen.ts`
- `i18n-types.ts`

## Review heuristics

### Prefer merge

- focused bug fix
- accessibility repair
- targeted UX improvement
- safe query fix
- small typing cleanup with clear value

### Prefer fix -> merge

- useful PR blocked by small lint, typing, naming, i18n, or accessibility defects

### Prefer close

- security risk
- tenant leak risk
- auth or schema change without clear justification
- low-value cosmetic churn
- very large PR with weak intent and no safe autonomous repair path

## Validation guidance

Use targeted validation first:

```bash
pnpm exec eslint <changed-files...>
git diff --check origin/master...pr-<PR_NUMBER>
```

Use package-level commands when justified:

```bash
pnpm --filter yeko-teacher lint
pnpm --filter yeko-school test
```

Be explicit when a full repo hook fails for unrelated pre-existing reasons. That is a repository health issue, not automatically a PR issue.
