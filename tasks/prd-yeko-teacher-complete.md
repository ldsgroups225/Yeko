# Product Requirements Document (PRD): Complete Yeko Teacher App

## Introduction/Overview

The Yeko Teacher App (`apps/teacher`) currently provides a solid foundation with authentication, teacher context management, and basic dashboard functionality. However, based on the legacy yeko-teach application analysis, there are **critical gaps** that prevent teachers from performing their daily teaching workflows effectively.

This PRD defines the implementation of all missing features to make the teacher app fully functional for daily teaching activities, covering:

- Attendance tracking (daily core workflow)
- Class management (CRUD operations)
- Student notes and behavior tracking
- Schedule enhancement with substitutions
- Parent communication
- Real-time updates
- Offline support

**Goal:** Transform the teacher app from a prototype into a production-ready, comprehensive teaching management platform that teachers can use daily for all teaching activities.

---

## Goals

1. **Enable Daily Attendance** - Teachers must be able to take attendance for every class, every day
2. **Complete Class Management** - Teachers must be able to create, edit, view, and manage classes and students
3. **Student Notes System** - Teachers must be able to document behavior, academic, and general notes for individual students
4. **Parent Communication** - Teachers must be able to communicate with parents individually or in bulk
5. **Schedule Awareness** - Teachers must see detailed schedule including substitutions and changes
6. **Real-time Updates** - Messages and notifications must update without manual refresh
7. **Reliability** - App must work offline and sync when connection is restored

---

## User Stories

### US1: Daily Attendance
>
> As a teacher, I want to take attendance for my class so that I can track which students are present and who is absent.

**Acceptance Criteria:**

- I can view the student roster for an active session
- I can mark students as present, absent, late, or excused
- I can save attendance with one tap
- I can see attendance history for each student
- I can see attendance rates for the class

### US2: Class Creation
>
> As a teacher, I want to create a new class so that I can manage a new group of students for the upcoming school year.

**Acceptance Criteria:**

- I can enter class name, grade, section, and subject
- I can assign students to the class from existing student database
- I can set classroom and schedule details
- The class appears in my class list immediately
- I can edit class details later if needed

### US3: Student Behavior Notes
>
> As a teacher, I want to create behavior notes for students so that I can document disruptions and track behavioral patterns over time.

**Acceptance Criteria:**

- I can create a note with title, content, and priority level
- I can categorize notes as behavior, academic, attendance, or general
- I can mark notes as private (teacher only) or shared with parents
- I can view a summary of notes by type and priority
- I can see the monthly trend of notes for each student

### US4: Bulk Parent Messaging
>
> As a teacher, I want to send messages to multiple parents at once so that I can efficiently communicate announcements or concerns to the whole class.

**Acceptance Criteria:**

- I can select a class or specific students
- I can compose a message with subject and content
- I can choose message category (attendance, grades, behavior, reminder)
- I can send to all parents or select specific ones
- I can track which messages have been delivered and read

### US5: Real-time Messages
>
> As a teacher, I want to receive messages in real-time so that I can respond quickly to parents and colleagues.

**Acceptance Criteria:**

- New messages appear automatically without page refresh
- I see typing indicators when someone is composing a message
- I know when my messages have been delivered and read
- I receive notifications for urgent messages

### US6: Offline Access
>
> As a teacher, I want to access my classes and student data offline so that I can prepare lessons and take attendance even with poor internet.

**Acceptance Criteria:**

- I can view my class roster offline
- I can take attendance offline and it saves
- When I reconnect, my offline changes sync automatically
- I see an indicator when I'm offline vs online
- I can view cached data like student profiles and class lists

---

## Functional Requirements

### 1. Attendance Tracking System

1.1. The system shall provide an attendance interface accessible from active sessions or class pages.

1.2. The system shall allow marking each student as:

- Present
- Absent
- Late
- Excused

1.3. The system shall display a student roster with:

- Student name
- Student photo (if available)
- Matricule number
- Previous attendance status

1.4. The system shall support saving attendance with a single action.

1.5. The system shall maintain an attendance history for each student viewable by:

- Date range
- Class
- Status type

1.6. The system shall calculate and display attendance rates for:

- Individual students
- Entire class
- Time periods (month, term, year)

1.7. The system shall generate absence reports showing:

- Students with excessive absences
- Absence patterns (days of week, times)
- Attendance trends

1.8. The system shall integrate with sessions so attendance is linked to specific class sessions.

**Technical:** Server function `saveAttendance()`, query `attendanceHistoryQueryOptions()`, query `attendanceRatesQueryOptions()`

---

### 2. Class Management CRUD

2.1. The system shall allow teachers to create new classes with:

- Class name
- Grade level selection
- Section (if applicable)
- Subject assignment
- Classroom/school year
- Homeroom teacher (optional)

2.2. The system shall allow editing existing class details.

2.3. The system shall allow archiving/deleting inactive classes (soft delete).

2.4. The system shall provide a class list view with:

- Class name and grade
- Subject
- Student count
- Next scheduled class
- Class status (active/inactive)

2.5. The system shall provide a class detail view showing:

- Complete class information
- Student roster with photos
- Schedule/timetable
- Enrolled subjects
- Class statistics (attendance rate, average grade, note count)

2.6. The system shall support student enrollment management:

- Add students to class
- Remove students from class
- View enrollment history

2.7. The system shall allow filtering classes by:

- Grade level
- Subject
- Search query (name, student)
- Sort by name, student count, next class

2.8. The system shall display class metrics:

- Average grade
- Attendance rate
- Total students
- Total notes
- Total sessions

**Technical:** Server functions `createClass()`, `updateClass()`, `deleteClass()`, `addClassStudents()`, query `classListQueryOptions()`, query `classDetailQueryOptions()`

---

### 3. Student Notes & Behavior Tracking

3.1. The system shall allow creating student notes with:

- Title (1-200 characters)
- Content (1-2000 characters)
- Type selection: behavior, academic, attendance, general
- Priority: low, medium, high, urgent
- Class association
- Privacy toggle (private/visible to parents)

3.2. The system shall allow editing and deleting existing notes.

3.3. The system shall provide a student notes list view with:

- All notes for a student
- Filter by type
- Filter by date range
- Sort by date or priority
- Pagination (default 50 per page)

3.4. The system shall display a behavior summary showing:

- Total notes count
- Count by type (behavior, academic, attendance, general)
- Count by priority (high/urgent count)
- Monthly trend data

3.5. The system shall support bulk note creation for:

- Multiple students in a class
- Same note content for multiple students

3.6. The system shall allow searching notes across all students by:

- Content keywords
- Type
- Priority
- Date range

3.7. The system shall notify parents when:

- A high or urgent note is created
- Parent notifications are enabled

**Technical:** Server functions `createStudentNote()`, `updateStudentNote()`, `deleteStudentNote()`, `bulkCreateNotes()`, query `studentNotesQueryOptions()`, query `behaviorSummaryQueryOptions()`

---

### 4. Schedule Enhancement

4.1. The system shall display detailed schedule with:

- Regular timetable sessions
- Substitution classes (teacher replacements)
- Cancellations
- Room changes
- Status indicators (as scheduled, substituted, cancelled)

4.2. The system shall allow teachers to request schedule changes for:

- Swapping sessions with another teacher
- Moving a session to different time
- Requesting coverage for absence
- Cancelling a class (with reason)

4.3. The system shall provide a schedule change request form with:

- Original session details
- Request type selection
- New date/time (if applicable)
- Target teacher (if swap/coverage)
- Reason (10-500 characters)

4.4. The system shall show request status:

- Pending
- Approved
- Rejected
- Cancelled

4.5. The system shall notify teachers of:

- New substitutions assigned to them
- Schedule change approvals
- Same-day schedule changes

4.6. The system shall display teacher substitution history.

**Technical:** Server functions `getDetailedSchedule()`, `requestScheduleChange()`, `getSubstitutions()`, query `scheduleQueryOptions()`

---

### 5. Parent Communication

5.1. The system shall provide parent contact information for each student:

- Parent name
- Phone number
- Email
- Relationship (father, mother, guardian)
- Preferred contact method (phone, email, SMS)
- Preferred language

5.2. The system shall allow sending individual messages to parents.

5.3. The system shall support bulk messaging to:

- All parents in a class
- Selected parents from a list
- Parents of selected students

5.4. The system shall provide a message composer with:

- Recipient selection (individual or bulk)
- Subject line (required)
- Message content (required)
- Category selection: attendance, grades, behavior, general, reminder, congratulations
- Priority: normal, high, urgent
- Template selection (optional)

5.5. The system shall track message delivery:

- Sent status
- Delivered timestamp
- Read receipt
- Failed delivery (with reason)

5.6. The system shall provide a message history showing:

- All sent messages
- Filter by recipient, category, date
- Show delivery status for each

5.7. The system shall support message templates for:

- Common announcements
- Absence notifications
- Grade reports
- Behavior notifications

**Technical:** Server functions `getParentContacts()`, `sendBulkMessages()`, `sendMessage()`, query `parentContactsQueryOptions()`, query `messageHistoryQueryOptions()`

---

### 6. Real-time Updates

6.1. The system shall establish WebSocket connection when user logs in.

6.2. The system shall automatically update UI for:

- New incoming messages
- Read receipts
- Typing indicators
- New notifications
- Live attendance updates (if other teachers updating)

6.3. The system shall handle connection events:

- Auto-reconnect on disconnect
- Reconnection backoff (exponential)
- Connection status indicator in UI

6.4. The system shall support channel subscriptions:

- Messages channel (for all conversations)
- Notifications channel
- Attendance updates (optional)
- Notes updates (optional)

6.5. The system shall authenticate WebSocket connections using:

- JWT token from session
- Channel-specific permissions

6.6. The system shall deliver real-time notifications for:

- New messages
- Schedule changes
- Emergency announcements
- Urgent parent responses

6.7. The system shall gracefully degrade to polling if WebSocket unavailable.

**Technical:** WebSocket server, hook `useRealtimeUpdates()`, authentication middleware for WebSocket

---

### 7. Offline Support

7.1. The system shall detect online/offline status automatically.

7.2. The system shall cache essential data locally:

- Class lists
- Student rosters with photos
- Schedule
- Basic profile data

7.3. The system shall queue offline actions:

- Create note (when offline)
- Send message (when offline)
- Save attendance (when offline)

7.4. The system shall sync queued actions when connection restores:

- Attempt sync automatically
- Show sync progress indicator
- Handle sync failures with retry logic (max 3 attempts)
- Show failed actions for manual retry

7.5. The system shall provide offline UI indicators:

- Visible banner showing "You're offline"
- Sync queue count indicator
- Last successful sync timestamp

7.6. The system shall use IndexedDB for local storage:

- Pending actions queue
- Cached data with expiry
- Sync metadata

7.7. The system shall implement conflict resolution:

- Last-write-wins for concurrent edits
- Manual review for conflicts (optional)

7.8. The system shall register a service worker for:

- Offline fallback page
- Cache of static assets
- Background sync API integration

**Technical:** IndexedDB manager, offline sync queue, service worker, hook `useOfflineStatus()`

---

## Non-Goals (Out of Scope)

The following features are **NOT** included in this PRD to manage scope:

- **Video conferencing** - No live video calls within the app
- **Parent-facing portal** - No separate app for parents to view student progress
- **Advanced analytics/BI** - No complex dashboards for school administrators
- **File management** - No file storage for documents, assignments, homework submissions
- **Payment processing** - No financial transactions or fee collection
- **Advanced grading calculations** - No GPA, class rank, or weighted grade formulas (basic average only)
- **Multi-language content management** - No CMS for managing translated content
- **Social features** - No teacher-to-teacher social networking
- **Calendar integration** - No Google Calendar, Outlook, or external calendar sync

---

## Design Considerations

### Mobile-First UI

The app must be optimized for mobile devices as teachers primarily use tablets and phones during class.

### French-First Localization

All UI strings must use the i18n system with French as primary language. Hardcoded English strings are prohibited.

### Consistent Design System

All components must use the existing `@workspace/ui` package components (Card, Button, Form, etc.).

### Loading States

All async operations must show skeleton loaders or spinners with consistent styling.

### Error Handling

- Show user-friendly error messages in French
- Provide retry buttons for failed operations
- Never crash the app on API errors

### Accessibility

- WCAG AA compliance for color contrast
- Screen reader friendly labels
- Keyboard navigation support

### Responsive Layout

- Bottom navigation for mobile
- Sidebar navigation for desktop
- Adaptive card layouts

### Iconography

Use Tabler Icons consistently (already installed in project).

---

## Technical Considerations

### Database (Neon)

All data operations must use the centralized `@repo/data-ops` package with Drizzle ORM. No direct database queries in server functions.

### Server Functions Pattern

All new backend operations must use `@tanstack/react-start`'s `createServerFn()` with Zod validation.

```typescript
export const myFunction = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ /* schema */ }))
  .handler(async ({ data }) => {
    // Implementation using @repo/data-ops
  })
```

### Query Pattern

All data fetching must use TanStack Query with `queryOptions` for reusability.

```typescript
export function myQueryOptions(params: MyParams) {
  return queryOptions({
    queryKey: ['teacher', 'feature', params.id],
    queryFn: () => myServerFunction({ data: params }),
    staleTime: 60 * 1000, // 1 minute
  })
}
```

### Real-Time Architecture Decision

Use **WebSocket server** for real-time updates (not Supabase Realtime).

**Reasoning:**

- More control over connection handling
- No dependency on Supabase for core functionality
- Can scale independently
- Better fits serverless architecture

**Implementation:**

- Cloudflare Workers with WebSocket support
- Simple JSON message protocol
- Channel-based subscriptions

### Offline Storage Strategy

Use **IndexedDB** directly (not Dexie or other libraries).

**Reasoning:**

- Native browser support, no additional dependencies
- Full control over schema
- Good performance for offline queue operations

**Schema:**

```text
pending_actions
  - id (primary)
  - type (create|update|delete)
  - entity (note|message|attendance)
  - data (JSON)
  - timestamp
  - synced (boolean)
  - retry_count

cached_data
  - key (primary)
  - data (JSON)
  - expiry (timestamp)
```

### Route Structure

All new routes must follow the TanStack Router file-based pattern under `/routes/_auth/app/`:

```text
routes/_auth/app/
├── classes.tsx              # List all classes
├── classes.$classId.tsx       # Class detail layout
├── classes.$classId.students.tsx  # Class student roster
├── classes.$classId.notes.tsx      # Class notes
├── students.tsx              # Student search
├── students.$studentId.tsx    # Student profile
├── students.$studentId.notes.tsx   # Student notes
├── students.$studentId.parents.tsx   # Student parent contacts
├── attendance.tsx            # Attendance taking
└── communications.tsx         # Bulk messaging
```

### Optimistic Updates

All mutations must use TanStack Query's optimistic updates for instant UI feedback.

### Error Boundaries

Each route must have an error boundary to prevent app crashes.

### Testing

- Unit tests for all server functions
- Integration tests for critical user flows (attendance, note creation)
- E2E tests for main workflows (playwright)

---

## Success Metrics

1. **Attendance Adoption**
   - 80% of daily classes have attendance recorded within 2 hours of class time

2. **Note Creation**
   - Average of 5+ notes created per teacher per week (behavior + academic)

3. **Message Engagement**
   - 70% of parent messages are read within 24 hours

4. **Offline Resilience**
   - 95% success rate for syncing offline actions when connection restored

5. **Performance**
   - Class list loads in < 500ms
   - Attendance submission completes in < 200ms
   - Real-time messages appear in < 300ms

6. **User Satisfaction**
   - < 5% support tickets related to new features
   - Positive feedback from teacher beta testers

7. **Adoption**
   - 90% of active teachers use at least one new feature weekly

---

## Open Questions

1. **WebSocket Server Infrastructure**: Should we use Cloudflare Workers WebSocket Durable Objects or a separate WebSocket server instance? (Cloudflare)

2. **Message Delivery Method**: For parent communications, should we integrate:
   - SMS service (Twilio) for urgent messages?
   - Email service (SendGrid/Postmark) for general messages?
   - Or keep it in-app messaging only for now? (use this I will setup push notification after the PWA)

3. **Attendance Policies**: Should the system enforce: (use your best judgment later I will finetune)
   - Maximum number of absences before automatic flagging?
   - Attendance threshold for grade submission?
   - Or leave policy decisions to schools?

4. **Note Retention**: How long should student notes be retained?
   - Forever (archived by school year)
   - 3 years (this, the school should backup)
   - Until student graduates
   - Manual deletion only?

5. **Parent Verification**: Should we verify parent contact information before allowing messaging?
   - Phone number verification via SMS code?
   - Email verification link?
   - Trust school-provided data? (Use this)

6. **Multi-Language Templates**: For bulk messaging, should templates be:
   - French only (primary market)?
   - Support multiple languages (English, Spanish)?
   - Customizable per teacher? (french by default with english)

---

## Implementation Phases Overview

### Phase 1: Week 1-2 - Attendance & Class Management

- Attendance tracking system (server functions + UI)
- Class CRUD operations
- Class detail views with student roster
- Basic class statistics

### Phase 2: Week 3-4 - Student Notes & Behavior

- Student notes CRUD
- Behavior summary dashboard
- Note filtering and search
- Bulk note creation

### Phase 3: Week 5 - Schedule Enhancement

- Detailed schedule view
- Schedule change request form
- Substitution display
- Request status tracking

### Phase 4: Week 6 - Parent Communication

- Parent contact management
- Bulk messaging composer
- Message templates
- Delivery tracking

### Phase 5: Week 7-8 - Real-time & Offline

- WebSocket infrastructure
- Real-time message updates
- IndexedDB setup
- Offline sync queue
- Service worker implementation

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-19  
**Status:** Ready for Development
