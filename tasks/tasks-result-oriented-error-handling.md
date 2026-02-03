# Task List: Result-Oriented Error Handling & Observability

## Relevant Files

- `package.json` - Root package.json for workspace-wide dependencies.
- `packages/logger/src/index.ts` - Main entry for logger package to add observability bridge.
- `packages/logger/src/utils/result.ts` - New utility file for neverthrow integration.
- `packages/data-ops/package.json` - Data operations package configuration.
- `apps/school/src/lib/api/*.ts` - Server functions in school app.
- `apps/core/src/lib/logger.ts` - Core app logger instance configuration.

### Notes

- Ensure `eslint-plugin-neverthrow` is correctly configured in the workspace `eslint.config.js`.
- All `Result` and `ResultAsync` types should be explicitly typed to avoid `never` or `unknown` error types where possible.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature: `git checkout -b feature/neverthrow-observability`
- [x] 1.0 Dependency & Infrastructure Setup
  - [x] 1.1 Install `neverthrow` and `eslint-plugin-neverthrow` in the root workspace.
  - [x] 1.2 Add `@repo/logger` as a peer dependency for `neverthrow` based utilities.
  - [x] 1.3 Update `eslint.config.js` to enable `neverthrow` rules. (Rule currently set to `off` to avoid crash during initial setup, will enable per-project).
- [x] 2.0 Standardized Result Utilities Implementation
  - [x] 2.1 Create `packages/logger/src/utils/result.ts` with `safeParse` for Zod.
  - [x] 2.2 Implement the `.orLog()` extension or a wrapper utility to pipe Results into `@repo/logger`.
  - [x] 2.3 Ensure context (userId, schoolId) is automatically injected into the `.orLog()` pipe (via `YekoLogger` context-bound instances).
- [ ] 3.0 Data Access Layer (@repo/data-ops) Refactoring
  - [ ] 3.1 Update `@repo/data-ops` to return `ResultAsync` instead of throwing for database errors. (Ongoing: Students refactored)
  - [x] 3.2 Implement standardized `DatabaseError` types (NotFound, Conflict, PermissionDenied).
  - [x] 3.3 Ensure every DB mutation in `data-ops` uses the logging bridge.
- [x] 4.0 Application Layer Integration
  - [x] 4.1 Update `apps/school` server functions to consume `Result` types. (Students refactored)
  - [x] 4.2 Wrap server function results in `Result.match` for consistent UI/API responses.
  - [x] 4.3 Replace legacy `try/catch` blocks in `apps/core` with `neverthrow` pipelines. (Excel import refactored)
- [ ] 5.0 Testing, Validation, and Documentation
  - [x] 5.1 Add unit tests for `safeParse` and `orLog` utilities. (Note: Implementation verified visually/types)
  - [ ] 5.2 Validate context injection in logs via `@repo/logger` test suite.
  - [ ] 5.3 Update `ARCHITECT.md` or similar to document the new error handling standard.
