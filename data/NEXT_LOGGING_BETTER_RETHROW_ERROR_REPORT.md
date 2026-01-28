# 📊 Student Data Refinement & Standardization Report

**Version:** 1.1.0
**Status:** 🏗️ Phase 6: Academic Lifecycle & Attendance - 🟢 COMPLETE
**Primary Goal:** Standardize error propagation using `neverthrow` and unify schema field naming.

---

## 🎯 Executive Summary

The Student and Enrollment Data modules have been fully refactored to comply with the **Yeko Result-Oriented Framework**. We have transitioned from implicit error throwing to explicit error handling using `ResultAsync`, resolved strict TypeScript linting issues, and synchronized the UI schemas with the Database naming conventions. The `StudentWithDetails` and `EnrollmentWithDetails` types now serve as the single source of truth for rich data requirements.

---

## ✅ 1. Accomplishments & Refinements

### 🏛️ Core Architecture Migration

We have established a new "Gold Standard" pattern for Data-to-UI communication.

| Component | Legacy Pattern | New Gold Standard |
| :--- | :--- | :--- |
| **Data Layer (@repo/data-ops)** | `Promise<T>` (throws on error) | `ResultAsync<T, DatabaseError>` |
| **Server Functions (apps/school)** | Raw returns / `throw Error` | `Promise<{ success: true; data: T } \| { success: false; error: string }>` |
| **Frontend Queries** | `if (!data) ...` | `if (result.success === true) { ... }` (Strict Narrowing) |

### 🔧 Key Implementation Details

- **Type Refinement**:
  - Implemented `StudentWithDetails` to accurately model relation-loaded student data (including `currentClass`).
  - Implemented `EnrollmentWithDetails` and `EnrollmentStatistics` for type-safe enrollment management.
  
- **Component Hardening**:
  - Updated critical UI components (`ProductCombobox`, `ImportDialog`, `StudentsList`, `GradeEntryTable`) to safely handle `ResultAsync` responses.
  - Implemented strict `if (!result.success)` checks before accessing nested data (`result.data.data`), preventing runtime crashes.
  - Added data coercion for nullable DB fields (e.g., `matricule || undefined`) to satisfy strict UI props.

- **Result Narrowing**: Explicit `Promise` return types in `students.ts` and `enrollments.ts` server functions ensure TypeScript preserves literal `true/false` for discriminated union narrowing.

### 🧬 Schema & UI Path Correction

- **Field Unification**: Synchronized the "Place of Birth" field naming:
  - **DB Column**: `birth_place`
  - **Zod Schema**: `birthPlace` (Renamed from `placeOfBirth`)
  - **UI Form**: `birthPlace`
- **Schema Sanitization**: Removed unauthorized/non-existent fields (`phone`, `email`, `notes`) from the student Zod schema.

---

## 🛠️ 2. Dependencies & Best Practices Established

1. **`neverthrow` (`ResultAsync`)**: Mandatory for all asynchronous operations in `data-ops`.
2. **`tapLogErr`**: Integrated into `ResultAsync` chains to ensure `databaseLogger` captures every failure context automatically.
3. **Strict Union Checks**: Frontend consumption MUST use `if (result.success === true)` to leverage the full benefit of the discriminating union.
4. **Discriminated Error Messages**: Errors are now categorized (e.g., `NOT_FOUND`, `VALIDATION_ERROR`) for better frontend localization and toast handling.

---

## ⚠️ 3. Known Risks & Edge Cases

- **Bulk Migration Complexity**: `bulkImportStudents` implementation handles multi-row success/failure logic slightly differently. Consistency auditing is required.
- **Context Dependency**: Most operations depend on `getSchoolContext()` and `getSchoolYearContext()`. Failures in context resolution must be handled gracefully in the next cycle.

---

## 🚀 4. Next Standardization Roadmap

The following modules are flagged for immediate refactoring to maintain system-wide consistency:

### 📍 Phase 1: Enrollments & Lifecycle (`enrollments.ts`) - **✅ COMPLETED**

- [x] Migrate `enrollmentQueries` to return `ResultAsync`.
- [x] Standardize `createEnrollment` server function.
- [x] Implement strict return type narrowing for `useQuery` options.

### 📍 Phase 2: Logging & Error Re-throwing (System-Wide) - **🔥 HIGHEST PRIORITY**

This phase aims to ensure that while we handle errors gracefully in the UI, we do not lose visibility into critical system failures. Current middleware implementation throws raw errors which bypass structured logging.

- [x] **Data Layer Logging (`@repo/data-ops`)**:
  - [x] Audit all queries to ensure `tapLogErr(databaseLogger)` is attached to every `ResultAsync` chain. (Confirmed: only students/enrollments use ResultAsync so far, and usages are correct).
  - [x] Standardize the `DatabaseError` class to include hierarchical error codes (e.g., `AUTH_MISSING_CONTEXT`, `PERM_DENIED`). (Added `UNAUTHORIZED`).

- [x] **Middleware Refactoring (`apps/school/middleware`)**:
  - [x] Refactor `requirePermission` and `getSchoolContext` to avoid raw `throw new Error(...)`. (Converted to `DatabaseError` with types).
  - [x] Introduce a `Result`-based return type or a dedicated `AuthError` that can be caught and logged by a wrapper.

- [x] **Server Function Wrapper**:
  - [x] Create a `createAuthenticatedServerFn` utility in `apps/school` that:
    - Automatically resolves Context & Auth.
    - Wraps the execution in a `try/catch` block (or `ResultAsync.fromPromise`).
    - Logs any unhandled exceptions to `serverAppLogger` or `securityLogger` before returning a standardized `{ success: false, error: "Internal Error" }` response to the client.

**Progress Note:**

- `createAuthenticatedServerFn` created in `apps/school/src/school/lib/server-fn.ts`.
- `enrollments.ts` refactored to use the new wrapper as a pilot.
- `auth.ts`, `school-context.ts`, and `permissions.ts` updated to throw typed `DatabaseError`.

### 📍 Phase 3: Infrastructure Scoping (`classes.ts` & `grades.ts`)

- [x] Refactor `student-grades.ts` to use `ResultAsync`.
- [x] Ensure `schoolId` multi-tenant scoping is enforced via the `data-ops` layer (for grades).
- [x] Simplify query return types to use the success/error union (for grades).
- [x] Refactor `classes.ts` (data-ops) to use `ResultAsync`.
- [x] Refactor `classes.ts` (server functions) to use `createAuthenticatedServerFn`.
- [x] Enforce `schoolId` scoping for class operations.

### 📍 Phase 4: User Relations (`parents.ts`) - **✅ COMPLETED**

- [x] Audit field naming (Check `phone` vs `phone2` and `email` consistency).
- [x] Implement `ResultAsync` for all parent-related queries and linking.
- [x] Refactor server functions to use `createAuthenticatedServerFn` and handle `isErr()`.
- [x] Verify strict `schoolId` scoping for parent-student associations.

### 📍 Phase 5: Financial Operations & Transactions (`payments.ts`, `fee-structures.ts`, `transactions.ts`) - **✅ COMPLETED**

- [x] Migrate `payments.ts`, `transactions.ts`, `installments.ts`, `discounts.ts`, `fee-types.ts`, and `fee-structures.ts` to `ResultAsync`.
- [x] Implement strict precision validation in `DatabaseError` for financial data.
- [x] Standardize error codes for "Payment Conflict" or "Invalid Installment Plan".
- [x] Standardize journal entries and fiscal year management.

### 📍 Phase 6: Academic Lifecycle & Attendance (`attendance.ts`, `programs.ts`) - **✅ COMPLETED**

#### ✅ Completed: Strict Type Refactoring (TypeScript Pro Standards)

**Objective**: Eliminate all `any` types from data-ops queries and enforce strict TypeScript typing throughout the academic lifecycle modules.

- [x] **`programs.ts`**: Refactored to remove `any` types
  - Created `ProgramWithDetails` type for program templates with school year, subject, and grade details
  - Updated `getProgramTemplates` to return `ProgramWithDetails[]`
  - Updated `getProgramTemplateById` to return `ProgramWithDetails | null`
  - Removed unsafe `any` type assertions in version restoration logic

- [x] **`class-subjects.ts`**: Refactored to remove `any` types
  - Created `ClassSubjectWithDetails` type for class-subject relationships
  - Created `AssignmentMatrixItem` type for teacher assignment matrix
  - Updated all 10 functions to return strict Drizzle-inferred types
  - Fixed nullable teacher field handling in query results
  - Added null checks for database operations returning potentially undefined values

- [x] **`school-subjects.ts`**: Refactored to remove `any` types
  - Created `SchoolSubjectWithDetails` type for school subjects with details
  - Created `SubjectUsageStats` type for subject usage statistics
  - Updated all 7 functions to return strict types
  - Fixed syntax errors from type definition placement

- [x] **`curriculum-progress.ts`**: Complete strict type refactoring
  - Created **9 comprehensive type definitions**:
    - `ClassSessionWithDetails` - class sessions with subject, teacher, chapter
    - `ClassSessionFull` - full session data with class, grade, series
    - `ChapterCompletionWithDetails` - chapter completions with relations
    - `CurriculumProgressWithDetails` - progress with subject and program template
    - `ProgressOverviewItem` - progress overview statistics
    - `ClassBehindSchedule` - classes falling behind schedule
    - `ProgressStatsByStatus` - progress stats by status
    - `ProgressBySubject` - progress aggregated by subject
    - `TeacherProgressSummaryItem` - teacher-specific progress summaries
  - Updated **17 function signatures** to use strict types instead of `any`
  - Fixed import issues (moved `series` from school-schema to core-schema)
  - Added proper null checks for all database operations
  - Removed unused `uuid` import (using `crypto.randomUUID()`)

**Metrics**:

- Files refactored: 4 (`programs.ts`, `class-subjects.ts`, `school-subjects.ts`, `curriculum-progress.ts`)
- Type definitions created: 12+ comprehensive types
- Functions with strict types: 40+
- TypeScript compilation: ✅ **CLEAN** (0 errors)

#### 🔄 Remaining Work

- [x] Refactor Student Attendance modules (`student-attendance.ts`, `teacher-student-attendance.ts`) to remove `any` types
- [x] Refactor remaining query files with `any` types:
  - [x] `catalogs.ts` (Refactored to use `ResultAsync` and strict types)
  - [x] `coefficients.ts` (Refactored to use `ResultAsync` and strict types)
  - [x] `classrooms.ts` (Refactored to use `ResultAsync` and strict types)
  - [x] `parents.ts` (Refactored to use `ResultAsync` and strict types)
  - [x] `students.ts` (Refactored to use `ResultAsync` and strict types)
- [x] Integrate `tapLogErr` with specific context for automated schedule validation failures

### 📍 Phase 7: Teacher Application & App Integration (`teacher-app.ts`) - **🏗️ IN PROGRESS**

- [x] Audit the critical `teacher-app.ts` module for `neverthrow` + `logger` penetration.
- [ ] Optimize `DatabaseError` payloads for mobile-friendly consumption.

---

## 🗣️ 5. Protocol for "Natural" Error Messages

To elevate error handling from technical logs to user-centric feedback, we are adopting the following standards:

1. **Context-Rich Codes**: Use descriptive sub-codes in `details` (e.g., `{ code: 'STUDENT_ALREADY_LINKED' }`) so the UI can provide the most relevant localized message.
2. **Safe Message Propagation**: Ensure `DatabaseError.message` is "Safe for UI" by default, while keeping technical stack traces in `originalError` (captured only by `tapLogErr`).
3. **Deep Penetration**: `neverthrow` should be utilized from the lowest database adapter up to the server function boundary, ensuring NO raw exceptions escape the structured lifecycle.

---

---

## 🛠️ 6. Refactoring & Fix Workflow (Protocol)

To maintain the high standards of the **Yeko Result-Oriented Framework**, all refactoring and bug fixing must follow this systematic protocol:

### 🔄 The "Result-First" Refactoring Cycle

1. **Identify Target**: Locate queries in `@repo/data-ops` (Queries) or server functions in `apps/school` (Functions).
2. **Data Layer Transformation**:
   - Change return types from `Promise<T>` to `ResultAsync<T, DatabaseError>`.
   - Apply `.mapErr(tapLogErr(databaseLogger, { ...context }))` for automated error capture.
3. **Type Propagation**:
   - Run `pnpm build --filter=@repo/data-ops` to update the shared `dist` folder. This is critical for consumers (`apps/school`, `apps/teacher`) to recognize the `ResultAsync` return type.
4. **Caller Refinement**:
   - Update Server Functions to use `createAuthenticatedServerFn`.
   - Directly handle `result.isErr()` and re-throw the error (the wrapper will catch and log it) or return the `result.value`.
5. **Validation Gate**:
   - **Typecheck**: Run `pnpm typecheck --filter=<app>` to catch "unhandled result" or "Promise mismatch" errors.
   - **Tests**: Execute `npx vitest run packages/data-ops/src/tests/<file>.test.ts`.

### 🧩 Peer Agent Collaboration

I leverage specialized sub-agents from `.claude/agents/` to ensure 360-degree quality:

- **TypeScript Pro (`02/typescript-pro.md`)**: Ensures strict/inherit typing and eliminates `any` types, it is always embedded.
- **Security Auditor (`04/security-auditor.md`)**: Verifies that every query enforces strict `schoolId` multi-tenant isolation.
- **Error Detective (`04/error-detective.md`)**: Helps refine the `DatabaseError` hierarchy and ensures "Natural" error messages are truly helpful.
- **Architect Reviewer (`04/architect-reviewer.md`)**: Ensures the `ResultAsync` pattern doesn't violate core systemic boundaries.
- **QA Expert (`04/qa-expert.md`)**: Consulted when designing integration tests for the `data-ops` layer.

### 🧪 Quality Assurance (Typechecking)

- **Execution**: Typechecks are run **synchronously** after any signature change.
- **Scope**: We prioritize `--filter=<affected-package>` to save time, followed by a full `--filter=school` before final validation.
- **Fail-Safe**: If a `typecheck` fails, we rollback the specific chunk or fix the type narrowing immediately using `isErr()` checks.

---

**Current Status:** 🟢 Students | 🟢 Enrollments | 🟢 Grades | 🟢 Classes | 🟢 Parents | 🟢 Finance
**Current Status:** 🟢 Students | 🟢 Enrollments | 🟢 Grades | 🟢 Classes | 🟢 Parents | 🟢 Finance | 🟢 Academic Lifecycle
**Next Targeted Action:** Start Phase 7: Teacher Application & App Integration.
