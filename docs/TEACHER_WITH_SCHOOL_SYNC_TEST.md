# ✅ MASTER TEST PROMPT – YEKO END-TO-END TEACHER WORKFLOW VALIDATION

## ROLE

You are a senior QA automation engineer with deep expertise in end-to-end browser testing, local database validation, state synchronization testing, and debugging distributed frontend systems.

You are extremely meticulous, systematic, and evidence-driven.

You must use:

* Chrome DevTools MCP
* Chrome DevTools browser automation
* Network inspection tools
* Application storage inspection (IndexedDB)
* Console debugging tools

You must test, debug, document, fix (if possible), and retest until the entire workflow is validated successfully.

---

## 🎯 OBJECTIVE

Perform a complete end-to-end validation of the Yeko ecosystem across:

* Teacher App → `http://localhost:3002`
* School App → `http://localhost:3001`

Validate that:

1. **Timetable & Schedule Sync**: Schedules created in the School App reflect immediately in the Teacher App.
2. **Local Persistence**: Teachers can create evaluations (grades, assignments, homework) and "Save" persists correctly into the teacher’s **local PGlite database** (IndexedDB: `yeko-teacher-local-db`).
3. **Remote Sync**: "Publish" correctly synchronizes data to the central database via Server Functions.
4. **Session Workflow**: Course sessions properly persist across multiple entities (Attendance, Participation, Homework, Curriculum progress).
5. **Cross-Instance Integrity**: All changes are reflected accurately in the School App.

You must test this exhaustively.

---

## 🧪 TEST PHASES

---

### PHASE 0 — TIMETABLE & SCHEDULE SYNCHRONIZATION

1. **Open School App (3001)**:
   * Navigate to the **Timetable/Schedule** section.
   * Add a new time slot for the teacher (`asamoagyan`) for a specific class and subject.
   * Ensure the slot is active and saved in the central database.

2. **Open Teacher App (3002)**:
   * Perform a hard refresh.
   * Verify the **Dashboard**: The new class session should appear in "Today's Schedule."
   * Verify **Schedule View**: The weekly view should correctly display the newly added time slot.

3. **Technical Validation**:
   * Inspect the network call to `getTeacherDaySchedule` or `getTeacherWeeklySchedule`.
   * Confirm the response payload contains the `timetableSessionId` created in Step 1.

---

### PHASE 1 — ENVIRONMENT INITIALIZATION

1. **Browser Session**: Open a new browser session via Chrome DevTools MCP.
2. **Navigation**: Navigate to: `http://localhost:3002`
3. **Health Check**:
   * App loads without console errors.
   * `ClientDatabaseManager` initialization success (Check console for `SELECT 1 as test` or "Database is ready").
   * **IndexedDB Verification**: Confirm `yeko-teacher-local-db` exists and has tables: `notes`, `note_details`, `sync_queue`.
4. **Authentication**: Authenticate via Google OAuth with `asamoagyan` account.

Capture:

* Network logs (Check for auth and metadata calls)
* Console logs
* Storage state (Initial sync queue status)

---

### PHASE 2 — CREATE CLASS EVALUATIONS (LOCAL SAVING)

1. **Class Selection**:
   * Navigate to a class.
   * Confirm students are listed and metadata loads properly.

2. **Evaluation Entry**:
   * Add multiple grades/evaluations for multiple students.
   * Add at least:
     * 1 regular grade (`CLASS_TEST`)
     * 1 assignment (`WRITING_QUESTION`)
     * 1 homework (`HOMEWORK`)
   * Modify at least one grade before saving.

3. **Save Verification**: Click “Save” and verify:
   * **Local Database** (IndexedDB):
     * Table `notes`: New record exists with `isPublished = false` and `isDirty = true`.
     * Table `note_details`: Records for each student exist with correct `value` and `isDirty = true`.
     * Table `sync_queue`: A new record with `operation = 'create'`, `tableName = 'notes'`, and `status = 'pending'`.
   * **Network**: Verify NO remote API call for grades was fired yet (Saving is local-only).

---

### PHASE 3 — PUBLISH FUNCTIONALITY (SYNCING)

1. **Publish Action**: Click **“Publish”**.
2. **Sync Verification**:
   * **Network**: API call to `submitGrades` server function fired with success (200).
   * **PGlite State**: Table `notes` & `note_details` have `isDirty = false` and `lastSyncAt` populated.
   * **Queue State**: Table `sync_queue` item is now `status = 'completed'`.
3. **Persistence**: Verify published data remains after hard refresh and UI reflects "Published" status.

---

### PHASE 4 — COURSE SESSION WORKFLOW

Inside Teacher App (3002):

1. **Start Session**:
   * Navigate to "Start Session" for the class scheduled in Phase 0.
   * Verify remote call to `startSession` fired.
2. **Session Actions**:
   * Mark attendance (Present/Absent/Late).
   * Assign participation scores (Stored locally first).
   * Assign homework (Title and due date).
   * Update Curriculum Progress: Mark a chapter as "Completed".
3. **Finalize Session**:
   * Click “End Session” / “Finalize”.
   * Verify batch API call to `completeSession` fired.
   * Ensure payload contains: `attendanceRecords`, `participationGrades`, `homework`, and `lessonCompleted = true`.
4. **Verify History**: Confirm local PGlite and history view reflect session completion.

---

### PHASE 5 — CROSS-INSTANCE VALIDATION

1. **School App (3001)**: Open independent session and authenticate (`yvesroland@julesverne.edu`).
2. **Data Consistency**:
   * **Grades**: Phase 3 evaluations appear correctly.
   * **Attendance**: Phase 4 session data is visible in School reports.
   * **Homework**: Assigned homework is visible and correctly linked.
   * **Curriculum**: Curriculum progress for the subject has updated.

---

## 🔎 DEBUGGING PROTOCOL

If any issue occurs, identify the root cause at the specific layer:

1. **Layer 1: UI/Form** (State not reaching Save handler)
2. **Layer 2: PGlite** (Local write failure / `isDirty` stay `true`)
3. **Layer 3: Sync Service** (Queue item stuck / `RemotePublishHandler` error)
4. **Layer 4: Server Function** (API 500 / Validation error)
5. **Layer 5: Remote DB** (Published but not visible in 3001)

Create a report in `/docs/e2e-test-report-[timestamp].md`.

---

## 🔐 VALIDATION DEPTH REQUIREMENTS

* **IndexedDB Content**: Use `idb` debugging tools to query the PGlite instance directly.
* **Sync Flags**: Crucial to check `isDirty`, `isDeleted`, and `lastSyncAt`.
* **Queue Status**: Monitor `sync_queue.status` transitions.
* **Payload Mapping**: Ensure `CLASS_TEST` (local) maps to `test` (remote) as per `remotePublishHandler` logic.

---

## 📊 COMPLETION CRITERIA

Testing is complete only when:

* All local-to-remote sync paths (including Timetable) are validated.
* Data integrity across `notes` → `grades` (remote) is confirmed.
* Cross-instance visibility is 100% consistent.
* A Final Report `/docs/final-e2e-validation-report.md` is generated.

---

## 🧠 EXECUTION PRINCIPLES

* **Verify the "Dirty" state**: Data is NOT published until it's "clean" (`isDirty = false`).
* **Check the Queue**: The `sync_queue` is the heartbeat of the offline-first logic.
* **Skepticism**: If Phase 5 fails, check the `grades` table on the remote DB using `run_sql`.

---

## 🤖 IMPLEMENTATION PEER-WORK AGENTS

The following five agents are assigned to work in peer to orchestrate, execute, and validate this E2E synchronization workflow:

### 1. Lead & System Architecture

* **Agent**: `02-language-specialists/typescript-pro.md`
* **Role**: Senior Architect. Ensures full-stack type safety across both School and Teacher applications. Responsible for the correctness of shared sync logic and Zod validation of data packets.

### 2. QA Strategy & State Validation

* **Agent**: `04-quality-security/qa-expert.md`
* **Role**: QA Strategist. Defines the meticulous test scenarios for "Dirty" vs "Clean" state transitions. Validates that the IndexedDB state precisely mirrors the requirements in Phase 2 and Phase 3.

### 3. Automation & Environment Control

* **Agent**: `04-quality-security/test-automator.md`
* **Role**: Automation Engineer. Implements the Chrome DevTools / Playwright scripts. Manages the lifecycle of the test browser, executes the health checks, and ensures IndexedDB verification is automated and repeatable.

### 4. Full-Stack Sync Orchestration

* **Agent**: `01-core-development/fullstack-developer.md`
* **Role**: Integration Specialist. Owns the data flow between the Teacher App (Local PGlite) and the School App (Remote Postgres). Debugs Layer 3 (Sync Service) and Layer 4 (Server Functions) issues during cross-instance validation.

### 5. Remote Database Integrity

* **Agent**: `05-data-ai/postgres-pro.md`
* **Role**: Postgres Expert. Validates the final authority of the Remote DB. Uses `run_sql` to confirm that "Published" data in the Teacher App is actually persisted and correctly indexed in the central Neon database.

---

> *Document Version: 1.1 (Agent Assignment Complete)*

========================

### Credentials

* **School scope (3001)**: `yvesroland@julesverne.edu` / `Aazzeerrtt88`
* **Teacher scope (3002)**: google Oauth with `asamoagyan` account

========================
