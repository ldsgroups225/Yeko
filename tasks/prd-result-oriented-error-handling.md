# PRD: Result-Oriented Error Handling & Observability

## 1. Introduction/Overview

This feature implements a functional, type-safe error handling strategy across the Yeko monorepository. By shifting from **Exception-based** (implicit) to **Result-based** (explicit) patterns using `neverthrow`, we aim to eliminate unhandled runtime crashes, improve developer productivity through better IDE intellisense, and guarantee that every business failure is observed and logged via `@repo/logger`.

## 2. Goals

- **Type Safety**: Propagate errors through the type system so they must be handled by the caller.
- **Zero Silent Failures**: Every error in critical business logic must be logged.
- **Improved MTTR**: Detailed diagnostic data (context, user, school) attached to every `Err` variant.
- **Standardization**: Uniform error handling pattern across `apps/school`, `apps/teacher`, `apps/core`, and `apps/data-service`.

## 3. User Stories

- **As a Developer**, I want the compiler to warn me if I forget to handle a database error, so I don't introduce bugs.
- **As a Security Auditor**, I want all unauthorized access attempts in the `Err` track to be automatically logged with the offending `schoolId`.
- **As a DevOps Engineer**, I want to see a clear trace of functional failures in the logs to debug production issues faster.

## 4. Functional Requirements

1. **Dependency Injection**: Add `neverthrow` and `eslint-plugin-neverthrow` to all `apps/` and `packages/data-ops`.
2. **Standardized Zod Wrapper**: Implement a `safeParse` utility that converts `z.SafeParse` results into `neverthrow.Result` objects.
3. **Observability Bridge**:
    - Add an `.orLog(logger, context)` extension or utility to the `Result` prototypes via a shared package.
    - Automatically attach `schoolId` and `userId` from the current context to logged errors.
4. **Data-Ops Refactoring**: Update all database query/mutation functions in `@repo/data-ops` to return `ResultAsync<T, DatabaseError>`.
5. **Server Function Safety**: Wrap all `TanStack Start` Server Functions in a `Result.match` block at the boundary to ensure consistent UI feedback (via `sonner` or similar).

## 5. Non-Goals (Out of Scope)

- Converting 100% of legacy utility functions (focus only on Business Logic and Data Layers).
- Replacing standard HTTP status codes (we will map Results to Status Codes at the boundary).
- Implementing a custom Result type from scratch (we use `neverthrow`).

## 6. Technical Considerations

- **Tenant Isolation**: Every `Err` variant logged must strictly adhere to the `schoolId` scoping rule defined in `security-audit.md`.
- **Performance**: Use `ResultAsync` to avoid blocking the event loop on I/O.
- **ESLint**: Enable `eslint-plugin-neverthrow/must-use-result` to enforce handling.

## 7. Success Metrics

- **Error Visibility**: 100% of errors in `packages/data-ops` are captured in `@repo/logger`.
- **Code Quality**: Reduction in `try/catch` boilerplate by at least 40% in Server Functions.
- **Reliability**: Zero "Internal Server Error (500)" responses without a corresponding error log.

## 8. Open Questions

- Should we define a global `AppError` union type or allow each service to define its own domain errors?
- How do we bridge `neverthrow` with `Better Auth`'s internal error handling?
