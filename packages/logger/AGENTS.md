# @repo/logger — Agent Guide

> **Structured logging library** for the Yeko platform, built on LogTape. Provides preconfigured loggers and the `tapLogErr` utility for ResultAsync error chains.
> Built with `tsup`. Consumed by all apps and packages.

See @../../AGENTS.md for logging conventions in the Result-oriented framework.

---

## Quick Reference

| Action | Command |
| --- | --- |
| Build | `pnpm build` |
| Dev (watch) | `pnpm dev` |
| Typecheck | `pnpm typecheck` |
| Lint + fix | `pnpm lint:fix` |

---

## Directory Structure

```text
src/
├── index.ts               # Main entry — barrel export
├── config/
│   ├── *.ts               # Logger configurations and sinks
├── instances/
│   ├── *.ts               # Named logger instances (databaseLogger, authLogger, etc.)
├── types/
│   └── *.ts               # Logger type definitions
└── utils/
    ├── *.ts               # tapLogErr and other error logging utilities
```

---

## Key Exports

```typescript
import { tapLogErr, databaseLogger } from '@repo/logger'

// Usage in ResultAsync chains
return getStudents(schoolId)
  .mapErr(tapLogErr(databaseLogger, 'getStudents'))
```

### `tapLogErr`

A tap utility that logs errors without altering the error value. Used in every `ResultAsync.mapErr()` chain:

```typescript
// tapLogErr(logger, context) → (error) => { logger.error(context, error); return error }
```

---

## Build

Built with `tsup` (produces ESM + CJS):

- ESM: `dist/index.js`
- CJS: `dist/index.cjs`
- Types: `dist/index.d.ts`

⚠️ **Must be built before apps can use it.** Run `pnpm build:logger` from root.

---

## Do NOT

- ❌ Use `console.log` in production code — use structured loggers from this package
- ❌ Skip `tapLogErr` in ResultAsync chains — errors must be auditable
- ❌ Add heavy dependencies — this is imported by every package
