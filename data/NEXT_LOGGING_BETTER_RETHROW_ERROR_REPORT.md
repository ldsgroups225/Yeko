# 📊 Student Data Refinement & Standardization Report

**Version:** 1.1.0
**Status:** 🏗️ Module Migration (Students & Enrollments) - 🟢 COMPLETE
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
  - [x] Refactor `requirePermission` and `getSchoolContext` to aviod raw `throw new Error(...)`. (Converted to `DatabaseError` with types).
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

### 📍 Phase 4: User Relations (`parents.ts`)

- [ ] Audit field naming (Check `phone` vs `phoneNumber` and `email` consistency).
- [ ] Implement `ResultAsync` for parent-student links.
- [ ] Refactor invitation logic to use the new error pattern.

---

**Current Status:** 🟢 Students Refined | 🟢 Enrollments Refined | 🟢 Logging Standardized | 🟢 Grades Refined
**Next Targeted Action:** Complete Phase 3: Classes Refinement.
