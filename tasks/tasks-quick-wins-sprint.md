# Tasks: Quick Wins Sprint — TODO Cleanup

**Source PRD:** [prd-quick-wins-sprint.md](./prd-quick-wins-sprint.md)  
**Created:** 2026-02-03  
**Status:** Completed

---

## Relevant Files

### Task 0: Feature Branch

- N/A - Git operations only

### Task 1: Sender Name in Messages (FR-04)

- `packages/data-ops/src/queries/teacher-app.ts` - Extend `getTeacherMessagesQuery` and `getMessageDetailsQuery` to include sender/recipient names
- `packages/data-ops/src/drizzle/school-schema.ts` - Reference for `teachers`, `parents`, `users` table relations
- `apps/teacher/src/teacher/functions/messages.ts` - Update to use new name fields from query

### Task 2: Chapter Name in Session Details (FR-03)

- `packages/data-ops/src/queries/teacher-app.ts` - Extend `getTeacherClassSessionById` to join with `programTemplateChapters`
- `packages/data-ops/src/drizzle/core-schema.ts` - Reference for `programTemplateChapters` table
- `apps/teacher/src/teacher/functions/sessions.ts` - Update to return `chapterName` from query

### Task 3: School Switcher Dropdown (FR-01)

- `apps/school/src/components/school/school-switcher.tsx` - Add Radix UI Select/Dropdown component
- `apps/school/src/hooks/use-school-context.tsx` - Reference for `switchSchool` function
- `@workspace/ui` - Import `Select` or `DropdownMenu` component

### Task 4: Timetable Conflict Detection (FR-02)

- `apps/school/src/routes/_auth/schedules.tsx` - Add conflict detection logic in `transformedTimetable`
- `apps/school/src/lib/utils/timetable-conflicts.ts` - Create utility for conflict detection (new file)
- `apps/school/src/lib/utils/timetable-conflicts.test.ts` - Unit tests for conflict detection

### Task 5: Internationalization

- `apps/teacher/src/i18n/fr/index.ts` - Add French translations for new strings
- `apps/teacher/src/i18n/en/index.ts` - Add English translations for new strings
- `apps/school/src/i18n/fr/index.ts` - Add French translations for school switcher
- `apps/school/src/i18n/en/index.ts` - Add English translations for school switcher

### Task 6: Testing and Verification

- Covered in sub-tasks (typecheck, lint, manual QA)

### Additional File (User Request)

- `packages/data-ops/drizzle.config.ts` - Add `support-schema.ts` to schema array
- `packages/data-ops/src/drizzle/support-schema.ts` - Support tickets, CRM, Knowledge Base schemas

### Notes

- Unit tests should be placed alongside the code files they are testing
- Use `pnpm --filter <package> test` to run tests for a specific package
- Use `pnpm --filter <package> typecheck` to run type checks
- All UI text must be internationalized (French primary, English secondary)
- Follow TypeScript Strict mode and ResultAsync patterns
- Multi-tenant isolation: all queries must include `schoolId` filtering

---

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

---

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature: `git checkout -b feature/quick-wins-sprint`

- [x] 1.0 Implement Sender Name in Messages (FR-04)
  - [x] 1.1 Review `teacherMessages` table schema and understand sender/recipient relationships
  - [x] 1.2 Extend `getTeacherMessagesQuery` in `packages/data-ops/src/queries/teacher-app.ts` to LEFT JOIN with `teachers` → `users` and `parents` tables to fetch sender names
  - [x] 1.3 Add `senderName` and `recipientName` fields to the query return type
  - [x] 1.4 Extend `getMessageDetailsQuery` to include sender/recipient names in message thread
  - [x] 1.5 Update `apps/teacher/src/teacher/functions/messages.ts` - remove placeholder "You"/"Parent" and use actual names from query
  - [x] 1.6 Handle fallback to "Unknown" if name cannot be resolved
  - [x] 1.7 Run `pnpm --filter @repo/data-ops typecheck` to verify no type errors

- [x] 2.0 Implement Chapter Name in Session Details (FR-03)
  - [x] 2.1 Review `programTemplateChapters` table in `core-schema.ts` and understand its relationship with `classSessions`
  - [x] 2.2 Extend `getTeacherClassSessionById` in `packages/data-ops/src/queries/teacher-app.ts` to LEFT JOIN with `programTemplateChapters` and fetch chapter name
  - [x] 2.3 Add `chapterName` field to the `TeacherClassSession` interface
  - [x] 2.4 Update `apps/teacher/src/teacher/functions/sessions.ts` to return `chapterName` from the query result (remove the TODO comment and `null` placeholder)
  - [x] 2.5 Ensure graceful fallback if `chapterId` is null or chapter is not found
  - [x] 2.6 Run `pnpm --filter @repo/data-ops typecheck` to verify no type errors

- [x] 3.0 Implement School Switcher Dropdown (FR-01)
  - [x] 3.1 Review existing `school-switcher.tsx` component and understand current structure
  - [x] 3.2 Import `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@workspace/ui/components/select`
  - [x] 3.3 Replace the placeholder button with a full `Select` component that lists all schools
  - [x] 3.4 Display school name for each option, with current school pre-selected
  - [x] 3.5 Add checkmark or visual indicator for the currently active school
  - [x] 3.6 Implement `onValueChange` handler to call school context switch function
  - [x] 3.7 Handle edge case: if user has only 1 school, show the dropdown in disabled/read-only state
  - [x] 3.8 Remove TODO comments after implementation
  - [x] 3.9 Run `pnpm --filter @repo/school typecheck` to verify no type errors

- [x] 4.0 Implement Timetable Conflict Detection (FR-02)
  - [x] 4.1 Create utility file `apps/school/src/lib/utils/timetable-conflicts.ts`
  - [x] 4.2 Implement `detectConflicts(sessions: TimetableSessionData[]): TimetableSessionData[]` function that:
    - Groups sessions by `dayOfWeek`
    - Checks for time overlaps within each day using: `(startA < endB) && (endA > startB)`
    - Returns sessions with `hasConflict: true` and `conflictsWith: string[]` (array of conflicting session IDs)
  - [x] 4.3 Create unit tests in `apps/school/src/lib/utils/timetable-conflicts.test.ts`:
    - Test: no conflict when sessions don't overlap
    - Test: conflict detected when two sessions overlap on same day
    - Test: no conflict for sessions on different days with same time
    - Test: edge case - back-to-back sessions (end of one equals start of next) should NOT conflict
  - [x] 4.4 Update `transformedTimetable` in `schedules.tsx` to use `detectConflicts` utility
  - [x] 4.5 Add visual indicator in `TimetableSessionCard` for conflicting sessions (red border or warning icon)
  - [x] 4.6 Add tooltip explaining the conflict on hover
  - [x] 4.7 Remove TODO comment after implementation
  - [x] 4.8 Run tests: `pnpm --filter @repo/school test` (Verified utility and form tests)

- [x] 5.0 Add Internationalization (i18n) for New Strings
  - [x] 5.1 Identify all new user-facing strings added in tasks 1-4
  - [x] 5.2 Add French translations for teacher app (`apps/teacher/src/i18n/fr/index.ts`):
    - Messages: "Expéditeur inconnu", "Vous"
  - [x] 5.3 Add English translations for teacher app (`apps/teacher/src/i18n/en/index.ts`):
    - Messages: "Unknown sender", "You"
  - [x] 5.4 Add French translations for school app if needed (school switcher, conflict detection)
  - [x] 5.5 Add English translations for school app if needed
  - [x] 5.6 Run `npx typesafe-i18n --no-watch` to generate types

- [x] 6.0 Integrate Support Schema into Drizzle Config (User Request)
  - [x] 6.1 Open `packages/data-ops/drizzle.config.ts`
  - [x] 6.2 Add `'./src/drizzle/support-schema.ts'` to the `schema` array
  - [x] 6.3 Run `pnpm --filter @repo/data-ops typecheck` to verify no type errors
  - [x] 6.4 Run `pnpm --filter @repo/data-ops drizzle-kit generate` to verify schema is recognized (if migrations are needed)

- [x] 7.0 Testing and Verification
  - [x] 7.1 Run full typecheck: `pnpm typecheck`
  - [x] 7.2 Run linter: `pnpm lint`
  - [x] 7.3 Run unit tests: `pnpm test`
  - [x] 7.4 Manual QA: Test school switcher with multi-school user account
  - [x] 7.5 Manual QA: Verify conflict detection in timetable view
  - [x] 7.6 Manual QA: Verify chapter name appears in session details
  - [x] 7.7 Manual QA: Verify sender names in teacher messages
  - [x] 7.8 Verify all TODOs have been removed from modified files
  - [x] 7.9 Create PR with summary of changes

---

## Available Roles Reference

For context, these are the available roles in the system (from `rolesData.ts`):

| Slug | Name (FR) | Scope |
| ------ | ----------- | ------- |
| `super_admin` | Super Administrateur | system |
| `system_admin` | Administrateur Système | system |
| `school_founder` | Fondateur / Promoteur | school |
| `school_director` | Directeur / Proviseur / Principal | school |
| `school_censor` | Censeur | school |
| `teacher` | Professeur / Enseignant | school |
| `educator` | Éducateur | school |
| `secretary` | Secrétaire | school |
| `accountant` | Comptable | school |
| `cashier` | Caissier/ère | school |
