# PRD: Quick Wins Sprint — TODO Cleanup

**Document Version:** 1.0  
**Created:** 2026-02-03  
**Status:** Draft  
**Priority:** High (3-4 weeks)

---

## 1. Introduction / Overview

This PRD outlines a focused sprint to address four self-contained TODO items identified in the Yeko codebase. These are "quick wins" — features that are partially implemented or require minimal additional work to complete, but significantly improve user experience and reduce technical debt.

### Problem Statement

Several areas of the application have placeholder implementations or incomplete features marked with TODO comments. These gaps create:

- **Usability friction** — Users cannot switch between schools easily
- **Missing functionality** — Conflict detection for schedules is absent
- **Incomplete data display** — Chapter names and sender names are not shown

### Solution

Complete the four identified TODO items to provide a polished, fully-functional experience for both school administrators and teachers.

---

## 2. Goals

| Goal | Description | Measurable Outcome |
| ------ | ------------- | ------------------- |
| **G1** | Enable multi-school users to switch schools | School switcher dropdown is functional |
| **G2** | Prevent scheduling conflicts | Conflicting timetable sessions are visually flagged |
| **G3** | Display chapter information in sessions | Chapter name appears in session details |
| **G4** | Show actual sender names in messages | Messages display real sender names instead of placeholders |

---

## 3. User Stories

### US-01: School Switcher Dropdown
>
> **As a** school administrator with access to multiple schools,  
> **I want to** switch between schools using a dropdown menu,  
> **So that** I can manage different schools without logging out.

**Acceptance Criteria:**

- [ ] Dropdown shows all schools the user has access to
- [ ] Current school is highlighted/selected
- [ ] Clicking another school switches context and reloads relevant data
- [ ] Loading state is shown during switch

---

### US-02: Timetable Conflict Detection
>
> **As a** school administrator creating a class schedule,  
> **I want to** see visual indicators when sessions overlap,  
> **So that** I can avoid scheduling conflicts.

**Acceptance Criteria:**

- [ ] Overlapping sessions for the same class are flagged with a warning color/icon
- [ ] Hover tooltip explains the conflict (e.g., "Conflicts with Math at 08:00-09:00")
- [ ] Conflicts are calculated client-side from existing timetable data

---

### US-03: Chapter Name in Session Details
>
> **As a** teacher viewing a class session,  
> **I want to** see the chapter name associated with the session,  
> **So that** I can quickly understand the curriculum context.

**Acceptance Criteria:**

- [ ] Session details page displays chapter name when `chapterId` is present
- [ ] Shows "—" or "Non spécifié" if no chapter is linked
- [ ] Chapter name is fetched from the database using the existing `chapterId`

---

### US-04: Actual Sender Name in Messages
>
> **As a** teacher viewing my messages,  
> **I want to** see the actual name of the parent or teacher who sent the message,  
> **So that** I know who I'm communicating with.

**Acceptance Criteria:**

- [ ] Message list shows sender's real name (not "Parent" or "You")
- [ ] Message details thread shows real names for each participant
- [ ] Falls back to role label if name is unavailable

---

## 4. Functional Requirements

### FR-01: School Switcher Component (`school-switcher.tsx`)

| ID | Requirement |
| ---- | ------------- |
| FR-01.1 | The system must display a dropdown menu when the school switcher button is clicked |
| FR-01.2 | The dropdown must list all schools the user has access to (from `getUserSchools()`) |
| FR-01.3 | Each school item must show the school name |
| FR-01.4 | The currently active school must be visually distinguished (checkmark or highlight) |
| FR-01.5 | Clicking a different school must trigger a context switch (update `schoolId` in context) |
| FR-01.6 | The system must show a loading/disabled state during school switching |
| FR-01.7 | The dropdown must be accessible (keyboard navigation, proper ARIA attributes) |

**Technical Notes:**

- Use Radix UI `Select` or `DropdownMenu` component from `@workspace/ui`
- Leverage existing `useSchoolContext()` hook for state management
- Call `switchSchool()` from the context when selection changes

---

### FR-02: Timetable Conflict Detection (`schedules.tsx`)

| ID | Requirement |
| ---- | ------------- |
| FR-02.1 | The system must detect overlapping sessions within the same class timetable |
| FR-02.2 | Two sessions conflict if they have the same `dayOfWeek` AND their time ranges overlap |
| FR-02.3 | Conflicting sessions must have `hasConflict: true` in the transformed data |
| FR-02.4 | Conflicting sessions must be visually marked (red border, warning icon, or similar) |
| FR-02.5 | Hovering over a conflicting session should show which other session it conflicts with |

**Technical Notes:**

- Time overlap logic: `(startA < endB) && (endA > startB)`
- Implement as a utility function for reusability
- Conflict detection runs client-side on already-fetched data

---

### FR-03: Chapter Name Fetch (`sessions.ts`)

| ID | Requirement |
| ---- | ------------- |
| FR-03.1 | The `getSessionDetails` function must return the chapter name when `chapterId` is present |
| FR-03.2 | If `chapterId` is null/undefined, `chapterName` must remain null |
| FR-03.3 | The chapter name must be fetched from the `chapters` table using the `chapterId` |
| FR-03.4 | The query must not fail if the chapter is missing (graceful fallback) |

**Technical Notes:**

- Add a join or sub-query in `getTeacherClassSessionById` or create a helper
- Ensure the chapter table schema is imported if needed

---

### FR-04: Sender Name in Messages (`messages.ts`)

| ID | Requirement |
| ---- | ------------- |
| FR-04.1 | The `getTeacherMessages` function must return the actual sender's name |
| FR-04.2 | The `getMessageDetails` function must return actual names in message thread |
| FR-04.3 | Sender name must be fetched by joining with the `users` table based on sender ID |
| FR-04.4 | If sender type is `teacher`, fetch teacher's user name |
| FR-04.5 | If sender type is `parent`, fetch parent's user name |
| FR-04.6 | Fallback to "Unknown" if name cannot be resolved |

**Technical Notes:**

- Extend `getTeacherMessagesQuery` in `@repo/data-ops` to include sender/recipient names
- May need to add a `LEFT JOIN` on `users` table through `teachers` or `parents` relations

---

## 5. Non-Goals (Out of Scope)

The following are explicitly **NOT** part of this sprint:

| Item | Reason |
| ------ | -------- |
| Notification sending (conduct, attendance, general) | Requires external integration (email/SMS/push) |
| Auth user creation | Requires auth provider integration |
| Analytics byGrade/bySeries | Requires schema work on enrollments linkage |
| Per-student attendance records | Phase 13/14 feature, needs schema design |
| E2E test implementation | Test infrastructure setup is a separate initiative |

---

## 6. Design Considerations

### UI Components to Use

| Feature | Component | Package |
| --------- | ----------- | --------- |
| School Switcher | `Select` or `DropdownMenu` | `@workspace/ui` |
| Conflict Indicator | `Tooltip` + Icon | `@tabler/icons-react`, `@workspace/ui` |
| Session Chapter Display | Text with fallback | Existing text styles |
| Message Sender Name | Text replacement | No new components |

### Styling Guidelines

- **Conflict color:** Use `destructive` variant or `text-red-500` for warnings
- **Active school:** Use `primary` variant or checkmark icon
- **Loading states:** Use existing `Skeleton` components
- **All text must be internationalized** (French primary, English secondary)

---

## 7. Technical Considerations

### Constraints

| Constraint | Impact |
| ------------ | -------- |
| No new database tables | All features use existing schema |
| No external APIs | All data comes from existing DB queries |
| Multi-tenant isolation | All queries must include `schoolId` filtering |
| TypeScript Strict mode | No `any` types; use proper typing |
| ResultAsync pattern | Data layer errors must use `tapLogErr` |

### Dependencies

| Feature | Dependencies |
| --------- | -------------- |
| School Switcher | `@workspace/ui`, `useSchoolContext` |
| Conflict Detection | Existing `transformedTimetable` data |
| Chapter Name | `chapters` table, `@repo/data-ops` |
| Sender Name | `users`, `teachers`, `parents` tables |

### Files to Modify

| File | Changes |
| ------ | --------- |
| `apps/school/src/components/school/school-switcher.tsx` | Add dropdown menu |
| `apps/school/src/routes/_auth/schedules.tsx` | Add conflict detection logic |
| `apps/teacher/src/teacher/functions/sessions.ts` | Fetch chapter name |
| `apps/teacher/src/teacher/functions/messages.ts` | Fetch sender names |
| `packages/data-ops/src/queries/teacher-app.ts` | Extend queries for names |

---

## 8. Success Metrics

| Metric | Target | How to Measure |
| -------- | -------- | ---------------- |
| School switching works | 100% of multi-school users can switch | Manual QA |
| Conflict detection accuracy | 100% of overlapping sessions flagged | Unit tests |
| Chapter name displayed | When present, 100% of sessions show chapter | Manual QA |
| Sender names displayed | 100% of messages show real names | Manual QA |
| No regressions | All existing tests pass | CI pipeline |
| i18n coverage | All new strings in FR/EN | i18n check script |

---

## 9. Open Questions

| # | Question | Owner | Status |
| --- | ---------- | ------- | -------- |
| 1 | Should school switch trigger a full page reload or just invalidate queries? | TBD | Open |
| 2 | Should conflict detection also check teacher availability (across classes)? | TBD | Open |
| 3 | What should be the UX if a user has only 1 school (hide switcher or show disabled)? | TBD | Open |
| 4 | Should sender name include role suffix like "Jean Dupont (Parent)"? | TBD | Open |

---

## 10. Implementation Order (Suggested)

Based on dependencies and complexity:

1. **FR-04: Sender Name** — Backend-first, extend data-ops query
2. **FR-03: Chapter Name** — Backend-first, simple join
3. **FR-01: School Switcher** — Frontend-only, uses existing data
4. **FR-02: Conflict Detection** — Frontend-only, client-side logic

---

## Appendix: TODO Locations

| TODO | File | Line |
| ------ | ------ | ------ |
| Add dropdown menu with school list | `apps/school/src/components/school/school-switcher.tsx` | 59 |
| Add conflict detection | `apps/school/src/routes/_auth/schedules.tsx` | 187 |
| Fetch chapter name if needed | `apps/teacher/src/teacher/functions/sessions.ts` | 225 |
| Get actual sender name | `apps/teacher/src/teacher/functions/messages.ts` | 40 |
