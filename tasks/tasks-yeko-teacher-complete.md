# Task List: Complete Yeko Teacher App Implementation

## Relevant Files

- `packages/data-ops/src/queries/teacher-attendance.ts` - Database queries for attendance operations
- `packages/data-ops/src/queries/teacher-classes.ts` - Database queries for class management
- `packages/data-ops/src/queries/teacher-notes.ts` - Database queries for student notes
- `packages/data-ops/src/queries/teacher-schedule.ts` - Database queries for schedule and substitutions
- `packages/data-ops/src/queries/parent-communication.ts` - Database queries for parent contacts and messages
- `apps/teacher/src/teacher/functions/attendance.ts` - Server functions for attendance
- `apps/teacher/src/teacher/functions/classes.ts` - Server functions for class CRUD
- `apps/teacher/src/teacher/functions/student-notes.ts` - Server functions for notes
- `apps/teacher/src/teacher/functions/schedule.ts` - Server functions for schedule operations
- `apps/teacher/src/teacher/functions/parent-communication.ts` - Server functions for messaging
- `apps/teacher/src/lib/queries/attendance.ts` - TanStack Query options for attendance
- `apps/teacher/src/lib/queries/classes.ts` - TanStack Query options for classes
- `apps/teacher/src/lib/queries/student-notes.ts` - TanStack Query options for notes
- `apps/teacher/src/lib/queries/schedule.ts` - TanStack Query options for schedule
- `apps/teacher/src/lib/queries/parent-communication.ts` - TanStack Query options for messaging
- `apps/teacher/src/lib/hooks/useRealtimeUpdates.ts` - WebSocket connection hook
- `apps/teacher/src/lib/hooks/useOfflineStatus.ts` - Offline detection hook
- `apps/teacher/src/lib/hooks/useOptimisticUpdates.ts` - Optimistic updates hooks
- `apps/teacher/src/routes/_auth/app/classes.tsx` - Class list page
- `apps/teacher/src/routes/_auth/app/classes.$classId.tsx` - Class detail layout
- `apps/teacher/src/routes/_auth/app/classes.$classId.students.tsx` - Class student roster
- `apps/teacher/src/routes/_auth/app/students.tsx` - Student search
- `apps/teacher/src/routes/_auth/app/students.$studentId.tsx` - Student profile
- `apps/teacher/src/routes/_auth/app/students.$studentId.notes.tsx` - Student notes page
- `apps/teacher/src/routes/_auth/app/students.$studentId.parents.tsx` - Student parent contacts
- `apps/teacher/src/routes/_auth/app/attendance.tsx` - Attendance taking page
- `apps/teacher/src/routes/_auth/app/schedule.tsx` - Enhanced schedule page
- `apps/teacher/src/routes/_auth/app/communications.tsx` - Bulk messaging page
- `apps/teacher/src/components/offline-indicator.tsx` - Offline status component
- `apps/teacher/src/components/network-status.tsx` - Network status banner
- `packages/data-ops/src/offline/offline-sync.ts` - IndexedDB sync manager
- `apps/teacher/public/sw.js` - Service worker for offline support

### Notes

- Unit tests should be placed alongside code files (e.g., `attendance.ts` and `attendance.test.ts` in same directory).
- Use existing test commands from project scripts.

---

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Update file after completing each sub-task, not just after completing an entire parent task.

---

## Tasks

- [x] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b feature/yeko-teacher-complete`)

- [x] 1.0 Implement Database Layer Foundation (@repo/data-ops)
  - [x] 1.1 Create `packages/data-ops/src/queries/teacher-attendance.ts` with attendance queries (teacher-attendance.ts already exists)
  - [ ] 1.2 Create `packages/data-ops/src/queries/teacher-classes.ts` with class management queries
  - [ ] 1.3 Create `packages/data-ops/src/queries/teacher-notes.ts` with student notes queries
  - [ ] 1.4 Create `packages/data-ops/src/queries/teacher-schedule.ts` with schedule and substitution queries
  - [ ] 1.5 Create `packages/data-ops/src/queries/parent-communication.ts` with parent contact and message queries
  - [ ] 1.6 Add necessary database tables to schema if not present (notes, parent_contacts, schedule_changes, etc.)
  - [ ] 1.7 Write unit tests for all new query functions

- [ ] 2.0 Implement Attendance Tracking System
  - [ ] 2.1 Create `apps/teacher/src/teacher/functions/attendance.ts` with saveAttendance() function
  - [ ] 2.2 Create `apps/teacher/src/lib/queries/attendance.ts` with attendanceHistoryQueryOptions() and attendanceRatesQueryOptions()
  - [ ] 2.3 Create `apps/teacher/src/routes/_auth/app/attendance.tsx` with attendance taking UI
  - [ ] 2.4 Build attendance roster component with student list (photos, names, matricules)
  - [ ] 2.5 Implement attendance status buttons (present, absent, late, excused)
  - [ ] 2.6 Build attendance history view with date/term filters
  - [ ] 2.7 Implement attendance rate calculation and display
  - [ ] 2.8 Add attendance statistics visualization (absence patterns, trends)
  - [ ] 2.9 Integrate with sessions to link attendance to specific class sessions
  - [ ] 2.10 Write unit tests for attendance server functions and queries
  - [ ] 2.11 Add French i18n strings for all attendance-related UI

- [x] 3.0 Implement Class Management CRUD
  - [ ] 3.1 Create `apps/teacher/src/teacher/functions/classes.ts` with createClass(), updateClass(), deleteClass(), addClassStudents()
  - [ ] 3.2 Create `apps/teacher/src/lib/queries/classes.ts` with classListQueryOptions() and classDetailQueryOptions()
  - [ ] 3.3 Create `apps/teacher/src/routes/_auth/app/classes.tsx` with class list view
  - [ ] 3.4 Implement class filtering (grade, subject, search) and sorting
  - [ ] 3.5 Create `apps/teacher/src/routes/_auth/app/classes.$classId.tsx` with class detail layout
  - [ ] 3.6 Build class creation/edit form with name, grade, section, subject fields
  - [ ] 3.7 Create `apps/teacher/src/routes/_auth/app/classes.$classId.students.tsx` with student roster
  - [ ] 3.8 Implement student enrollment management (add/remove students)
  - [ ] 3.9 Display class metrics (attendance rate, average grade, note count)
  - [ ] 3.10 Implement soft delete for archiving inactive classes
  - [ ] 3.11 Write unit tests for all class server functions and queries
  - [ ] 3.12 Add French i18n strings for all class management UI

- [ ] 4.0 Implement Student Notes & Behavior Tracking
  - [ ] 4.1 Create `apps/teacher/src/teacher/functions/student-notes.ts` with createStudentNote(), updateStudentNote(), deleteStudentNote(), bulkCreateNotes()
  - [ ] 4.2 Create `apps/teacher/src/lib/queries/student-notes.ts` with studentNotesQueryOptions() and behaviorSummaryQueryOptions()
  - [ ] 4.3 Create `apps/teacher/src/routes/_auth/app/students.tsx` with student search
  - [ ] 4.4 Create `apps/teacher/src/routes/_auth/app/students.$studentId.tsx` with student profile
  - [ ] 4.5 Create `apps/teacher/src/routes/_auth/app/students.$studentId.notes.tsx` with notes list
  - [ ] 4.6 Build note creation form with title, content, type, priority fields
  - [ ] 4.7 Implement note type selection (behavior, academic, attendance, general)
  - [ ] 4.8 Add privacy toggle (teacher only vs visible to parents)
  - [ ] 4.9 Build behavior summary dashboard with counts by type and priority
  - [ ] 4.10 Implement note filtering (type, date range) and search
  - [ ] 4.11 Create monthly trend visualization for notes
  - [ ] 4.12 Implement bulk note creation for multiple students
  - [ ] 4.13 Write unit tests for all note server functions and queries
  - [ ] 4.14 Add French i18n strings for all notes-related UI

- [ ] 5.0 Implement Schedule Enhancement
  - [ ] 5.1 Extend `apps/teacher/src/teacher/functions/schedule.ts` with getDetailedSchedule() and requestScheduleChange()
  - [ ] 5.2 Extend `apps/teacher/src/lib/queries/schedule.ts` with enhanced schedule query options
  - [ ] 5.3 Enhance `apps/teacher/src/routes/_auth/app/schedule.tsx` with detailed view
  - [ ] 5.4 Display substitution classes with status indicators
  - [ ] 5.5 Show cancellations and room changes
  - [ ] 5.6 Build schedule change request form with request type selection
  - [ ] 5.7 Implement request status tracking (pending, approved, rejected)
  - [ ] 5.8 Add teacher substitution history view
  - [ ] 5.9 Write unit tests for schedule server functions
  - [ ] 5.10 Add French i18n strings for schedule-related UI

- [ ] 6.0 Implement Parent Communication System
  - [ ] 6.1 Create `apps/teacher/src/teacher/functions/parent-communication.ts` with getParentContacts(), sendBulkMessages(), sendMessage()
  - [ ] 6.2 Create `apps/teacher/src/lib/queries/parent-communication.ts` with parentContactsQueryOptions() and messageHistoryQueryOptions()
  - [ ] 6.3 Create `apps/teacher/src/routes/_auth/app/students.$studentId.parents.tsx` with parent contacts
  - [ ] 6.4 Display parent information (name, phone, email, relationship, preferred contact)
  - [ ] 6.5 Create `apps/teacher/src/routes/_auth/app/communications.tsx` with bulk messaging
  - [ ] 6.6 Build message composer with recipient selection, subject, content fields
  - [ ] 6.7 Implement message category selection (attendance, grades, behavior, reminder, congratulations)
  - [ ] 6.8 Add priority levels (normal, high, urgent)
  - [ ] 6.9 Implement message templates system
  - [ ] 6.10 Track message delivery (sent, delivered, read receipts)
  - [ ] 6.11 Build message history with filtering (recipient, category, date)
  - [ ] 6.12 Write unit tests for all messaging server functions
  - [ ] 6.13 Add French i18n strings for all communication-related UI

- [ ] 7.0 Implement Real-time Updates (WebSocket)
  - [ ] 7.1 Design WebSocket message protocol and channel structure
  - [ ] 7.2 Create WebSocket server handler (Cloudflare Workers with WebSocket support)
  - [ ] 7.3 Implement JWT-based WebSocket authentication
  - [ ] 7.4 Create `apps/teacher/src/lib/hooks/useRealtimeUpdates.ts` hook
  - [ ] 7.5 Implement auto-reconnect logic with exponential backoff
  - [ ] 7.6 Add connection status indicator to UI
  - [ ] 7.7 Implement channel subscriptions (messages, notifications)
  - [ ] 7.8 Handle real-time message updates and UI refresh
  - [ ] 7.9 Add typing indicators support
  - [ ] 7.10 Implement read receipt handling
  - [ ] 7.11 Add graceful degradation to polling if WebSocket unavailable
  - [ ] 7.12 Write tests for WebSocket connection and message handling
  - [ ] 7.13 Add French i18n strings for connection status messages

- [ ] 8.0 Implement Offline Support & Service Worker
  - [ ] 8.1 Create `packages/data-ops/src/offline/offline-sync.ts` with IndexedDB manager
  - [ ] 8.2 Define IndexedDB schema (pending_actions, cached_data, sync_metadata)
  - [ ] 8.3 Implement offline queue for pending actions (notes, messages, attendance)
  - [ ] 8.4 Create sync logic with retry mechanism (max 3 attempts)
  - [ ] 8.5 Create `apps/teacher/src/lib/hooks/useOfflineStatus.ts` hook for online/offline detection
  - [ ] 8.6 Build offline indicator banner component
  - [ ] 8.7 Add sync queue count indicator to UI
  - [ ] 8.8 Implement data caching for classes, students, schedule
  - [ ] 8.9 Create `apps/teacher/public/sw.js` service worker
  - [ ] 8.10 Register service worker for offline fallback page
  - [ ] 8.11 Implement static asset caching in service worker
  - [ ] 8.12 Add background sync API integration
  - [ ] 8.13 Implement conflict resolution (last-write-wins)
  - [ ] 8.14 Write tests for offline sync and IndexedDB operations
  - [ ] 8.15 Add French i18n strings for offline status messages

- [ ] 9.0 Integration Testing & Polish
  - [ ] 9.1 Run full integration test suite
  - [ ] 9.2 Test attendance flow end-to-end
  - [ ] 9.3 Test class creation, editing, and deletion
  - [ ] 9.4 Test student notes creation and behavior summary
  - [ ] 9.5 Test bulk parent messaging
  - [ ] 9.6 Test real-time message updates
  - [ ] 9.7 Test offline queue and sync functionality
  - [ ] 9.8 Test all French i18n strings for accuracy
  - [ ] 9.9 Run LSP diagnostics to ensure no type errors
  - [ ] 9.10 Run linting and fix any issues
  - [ ] 9.11 Test mobile responsiveness for all new pages
  - [ ] 9.12 Test accessibility (WCAG AA compliance)

- [ ] 10.0 Deployment & Documentation
  - [ ] 10.1 Update README.md with new features
  - [ ] 10.2 Update package.json with any new dependencies
  - [ ] 10.3 Prepare changelog entry for release
  - [ ] 10.4 Create migration guide if database schema changes needed
  - [ ] 10.5 Test deployment to staging environment
  - [ ] 10.6 Review and answer open questions from PRD
  - [ ] 10.7 Create PR with comprehensive description
  - [ ] 10.8 Update feature branch with final commit

---

## Summary

Total Parent Tasks: 10 (including branch creation)
Total Sub-Tasks: ~130+ tasks

Estimated Timeline: 5-8 weeks as specified in PRD

- Phase 1 (Tasks 1-3): Weeks 1-2 - Attendance & Class Management
- Phase 2 (Task 4): Weeks 3-4 - Student Notes & Behavior
- Phase 3 (Task 5): Week 5 - Schedule Enhancement
- Phase 4 (Task 6): Week 6 - Parent Communication
- Phase 5 (Tasks 7-8): Weeks 7-8 - Real-time & Offline
- Phase 6 (Tasks 9-10): Weeks 8 - Testing & Deployment

---

**Task List Version:** 1.0
**Based on PRD:** prd-yeko-teacher-complete.md
**Generated:** 2026-01-19
**Status:** Ready for Development
