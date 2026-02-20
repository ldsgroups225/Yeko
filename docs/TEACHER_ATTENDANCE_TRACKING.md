# IMPLEMENTATION PROMPT — TEACHER PUNCTUALITY & PRESENCE SYSTEM

## Role

You are a senior software developer assigned to implement a **Teacher Punctuality and Presence Tracking System** inside an existing offline-first (PWA + mobile) school management application.

Before writing any code:

1. Read and understand the current project architecture.
2. Identify how sessions are currently created, stored, and synchronized.
3. Review existing time management, authentication, and local storage mechanisms.
4. Analyze how offline sync is currently implemented.

Do not modify core flows without understanding current session lifecycle logic.

---

# 1. Problem Definition

The application already supports:

* Starting a class session
* Taking student attendance
* Assigning participation
* Adding homework
* Ending a session

However, it does **not** measure:

* Teacher punctuality
* Teacher continuous presence during the session

Your task is to implement a robust punctuality and presence tracking system compatible with an **offline-first architecture**.

---

# 2. Technical Constraints

The implementation must respect:

* Offline-first behavior
* Deferred synchronization
* Server-trusted time (via offset)
* GPS-based validation
* Full operability without immediate connectivity

No feature may require permanent online connectivity.

---

# 3. Architecture Requirements

## 3.1 Time Reference System

All time validation must use:

```
correctedTime = Date.now() + offset
```

Where:

* `offset` is computed during last successful server sync
* Offset must be stored locally
* Offset must be refreshed whenever a valid server response is received

All punctuality calculations must rely exclusively on `correctedTime`.

Never use raw device time directly.

---

## 3.2 Session Start Validation

The "Start Session" action must:

1. Capture corrected timestamp
2. Capture GPS coordinates
3. Classify punctuality status

Time window logic:

* Window opens: 10 minutes before official start time
* Classification:

  * On time: timestamp ≤ official start
  * Late: timestamp > official start
  * Significantly late: exceeds defined tolerance threshold

This logic must function offline.

---

## 3.3 GPS Validation

At session start:

Conditions required:

* Distance ≤ 200 meters from official school location
* Acceptable GPS accuracy

You must:

* Calculate geodesic distance (Haversine formula)
* Store latitude and longitude locally
* Store accuracy metadata

No session should be validated without GPS capture.

---

## 3.4 Random Presence Ping (15–20 Minutes)

During an active session:

* Generate randomized intervals between 15 and 20 minutes
* At each interval:

  * Capture corrected timestamp
  * Capture GPS coordinates
  * Validate distance ≤ 200m
  * Store event locally

Randomization must prevent predictable fixed intervals.

Example approach:

```javascript
interval = random(15min, 20min)
```

All pings must work offline.

---

# 4. Data Persistence Model (Offline-First)

All tracking events must be stored locally using a structure similar to:

```json
{
  "sessionId": "...",
  "teacherId": "...",
  "timestamp": 123456789,
  "latitude": 0.0000,
  "longitude": 0.0000,
  "type": "start | ping | end",
  "synced": false
}
```

Events must never be lost if the device disconnects.

---

# 5. Session End Handling

At session end:

Aggregate locally:

* Start time
* End time
* Total number of pings
* Number of valid pings (within 200m)
* Effective presence duration

Mark session as complete locally.

---

# 6. Synchronization Workflow

Upon reconnection:

1. Send all unsynced events to server
2. Server must:

   * Recalculate distances
   * Validate timestamps
   * Detect anomalies
3. Mark events as synced
4. Recalculate teacher reliability score

Server validation is final authority.

Punctuality becomes official only after successful sync.

---

# 7. Teacher Reliability Score

Score must be calculated using three components:

### 1. Start Punctuality

Time difference between official start and actual start.

### 2. Presence Continuity

Percentage of valid pings during session.

### 3. Position Stability

Analysis of GPS variance across pings.

Score must be recalculated after full synchronization.

---

# 8. Storage & Validation Rules

Punctuality must be saved:

### A. At Session Start

Immediately store:

* Corrected timestamp
* GPS position
* Punctuality classification

### B. At Session End

Consolidate session metrics.

### C. After Server Sync

Server:

* Validates punctuality
* Calculates final reliability score
* Archives session

Only server-confirmed punctuality is authoritative.

---

# 9. Implementation Requirements

* Must not break existing attendance logic
* Must not block session flow when offline
* Must ensure idempotent sync
* Must prevent duplicate event creation
* Must handle app termination mid-session
* Must recover ping scheduling after app resume

---

# 10. Deliverables

1. Time offset module
2. GPS validation utility
3. Randomized ping scheduler
4. Local event persistence layer
5. Sync reconciliation logic
6. Reliability score computation module
7. Technical documentation

---

# Expected Outcome

The implemented system must:

* Measure teacher punctuality
* Measure continuous presence
* Operate fully offline
* Sync reliably
* Ensure server-side validation authority
* Produce a composite reliability score

Do not begin coding until the current session lifecycle and storage architecture are fully reviewed.

End of implementation prompt.

---

# Code Review v1 — Implementation Assessment

**Date:** 2026-02-19
**Reviewer:** Amp (automated)
**Scope:** All changed/new files in the Teacher Punctuality & Presence Tracking implementation

## Results Summary (v1)

**8 issues found (2 CRITICAL, 3 HIGH, 2 MEDIUM, 1 LOW)**

| # | Severity | Issue | Status in v2 |
| --- | --- | --- | --- |
| 1 | CRITICAL | Server sync function is a stub with no auth | ⚠️ Partially fixed |
| 2 | CRITICAL | Session state is memory-only — no crash/reload recovery | ✅ Fixed |
| 3 | HIGH | Missing `schoolId` column in `tracking_events` table | ✅ Fixed |
| 4 | HIGH | School coordinates not passed to `startSession` | ✅ Fixed |
| 5 | HIGH | Migration check uses latest table instead of versioning | ⚠️ Improved |
| 6 | MEDIUM | Use of `any` type in tracker.ts | ✅ Fixed |
| 7 | MEDIUM | Non-null assertions on array access | ❌ Not fixed |
| 8 | LOW | `setInterval` leak on HMR | ✅ Fixed |

---

# Code Review v2 — Re-Review After Fixes

**Date:** 2026-02-19
**Reviewer:** Amp (automated)
**Scope:** Re-review after developer fixes. Includes new files in `packages/data-ops/` and `components/`.

## Files Reviewed

| File | Status |
| --- | --- |
| `apps/teacher/src/lib/tracking/tracker.ts` | **New** |
| `apps/teacher/src/lib/tracking/time-sync.ts` | **New** |
| `apps/teacher/src/lib/tracking/reliability.ts` | **New** |
| `apps/teacher/src/lib/tracking/storage.ts` | **New** |
| `apps/teacher/src/lib/utils/geo.ts` | **New** |
| `apps/teacher/src/teacher/functions/tracking.ts` | **New** |
| `apps/teacher/src/teacher/functions/server-time.ts` | **New** |
| `apps/teacher/src/hooks/use-class-detail-session.ts` | **Modified** |
| `apps/teacher/src/lib/db/schema.ts` | **Modified** |
| `apps/teacher/src/lib/db/migration-runner.ts` | **Modified** |
| `apps/teacher/src/components/class-details/ClassDetailPage.tsx` | **Modified** (new: school location wiring) |
| `apps/teacher/src/components/class-details/ClassDetailHeader.tsx` | **Modified** (new: GPS badge) |
| `apps/teacher/src/teacher/functions/schools.ts` | **Modified** (exposed lat/lng) |
| `apps/teacher/src/routes/_auth/app.tsx` | **Modified** (import reorder only) |
| `packages/data-ops/src/drizzle/core-schema.ts` | **Modified** (lat/lng on schools) |
| `packages/data-ops/src/drizzle/school-schema.ts` | **Modified** (new server-side trackingEvents table) |

---

## Results Summary (v2)

**5 issues remaining (1 CRITICAL, 2 HIGH, 1 MEDIUM, 1 LOW)**

---

### Issue #1 — CRITICAL: Server sync function throws instead of returning errors

**File:** `apps/teacher/src/teacher/functions/tracking.ts:24, 48, 109`

**Problem:** The server function now has auth and DB persistence (great!), but it uses `throw new Error(...)` in three places: unauthorized, school not found, and DB insert failure. The project's No-Throw Policy requires returning `{ success: false, error }` instead.

**Why:** Thrown errors from server functions produce unstructured 500 responses. The client-side `sync()` in `tracker.ts` catches them generically, but loses the error details. All other server functions in the codebase return `{ success: false, error: message }`.

**Fix:** Replace the three `throw` statements with early returns:
```typescript
if (!context) {
  return { success: false, error: 'Unauthorized', count: 0, reliabilityScore: null }
}
// ...
if (!school) {
  return { success: false, error: 'School not found', count: 0, reliabilityScore: null }
}
// ...
catch (e) {
  console.error('Failed to insert tracking events', e)
  return { success: false, error: 'Failed to persist events', count: 0, reliabilityScore: null }
}
```

---

### Issue #2 — HIGH: Multiple uses of `any` type in server function

**File:** `apps/teacher/src/teacher/functions/tracking.ts:59, 134, 159`

**Problem:** Three occurrences of `any` remain in the server function:
- Line 59: `let metadata: any = {}`
- Line 134: `const meta = p.metadata as any`
- Line 159: `...(endEvent.metadata as any)`

Also, the Zod schema uses `z.any().nullable()` for `metadata` (line 14).

**Why:** The project enforces strict TypeScript with no `any`. These bypass type safety on the server-side validation path, which is the most security-critical code.

**Fix:** Define a shared `TrackingMetadata` Zod schema and TypeScript interface:
```typescript
const trackingMetadataSchema = z.object({
  status: z.string().optional(),
  distance: z.number().optional(),
  isValid: z.boolean().optional(),
  schoolLat: z.number().optional(),
  schoolLon: z.number().optional(),
  serverCalculatedDistance: z.number().optional(),
  serverVerified: z.boolean().optional(),
  serverVerificationTime: z.string().optional(),
  reliabilityScore: z.any().optional(), // nested structure
}).nullable()
```
Replace `z.any().nullable()` in the event schema and all `as any` casts in the handler.

---

### Issue #3 — HIGH: Hardcoded "GPS" string in UI

**File:** `apps/teacher/src/components/class-details/ClassDetailHeader.tsx:54`

**Problem:** The text `GPS` is hardcoded in the JSX badge. The teacher app uses typesafe-i18n and all UI strings must use `LL.key()`.

**Fix:** Add an i18n key (e.g., `LL.session.gpsActive()` or `LL.tracking.gps()`) and use it instead of the literal string.

---

### Issue #4 — MEDIUM: Non-null assertions on array access (unchanged from v1)

**File:** `apps/teacher/src/lib/tracking/reliability.ts:73-76`

**Problem:** `session.pings[i - 1]!` and `session.pings[i]!` still use non-null assertions.

**Fix:**
```typescript
const prev = session.pings[i - 1]
const curr = session.pings[i]
if (prev && curr) {
  totalDistance += calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude)
}
```

---

### Issue #5 — LOW: `officialStartTime` equals `actualStartTime` in reliability calculation

**File:** `apps/teacher/src/teacher/functions/tracking.ts:131-132`

**Problem:** Both `officialStartTime` and `actualStartTime` are set to `startEvent.timestamp.getTime()`. This means the punctuality score will always be 100 (no delay detected), making the entire punctuality component of the reliability score meaningless.

**Why:** The spec requires "Time difference between official start and actual start" (§7.1). The `officialStartTime` should come from the timetable's scheduled start time, not the tracking event.

**Fix:** Look up the timetable session's official start time from the database and pass it as `officialStartTime`. The tracking event's timestamp is the `actualStartTime`.

---

## Issues Fixed Since v1 ✅

| v1 Issue | Resolution |
| --- | --- |
| #2 (CRITICAL): Memory-only session state | ✅ **Fully resolved.** `PersistedState` saved to localStorage via `persistState()`. `initialize()` restores state and resumes ping loop. `endSession()` clears it. |
| #3 (HIGH): Missing `schoolId` | ✅ **Fully resolved.** `schoolId` added to PGlite schema, SQL migration, Drizzle table, and all storage calls. Server-side table also includes `schoolId` with FK to `schools`. |
| #4 (HIGH): School coords not passed | ✅ **Fully resolved.** `ClassDetailPage` fetches school data via `teacherSchoolsQueryOptions`, extracts lat/lng, passes to hook. Hook passes to `startSession()`. |
| #5 (HIGH): Migration versioning | ⚠️ **Improved.** Added `ALTER TABLE` fallback for existing DBs missing `school_id`. Still not a proper versioning system, but the `IF NOT EXISTS` + column check pattern is acceptable for now. |
| #6 (MEDIUM): `any` in tracker.ts | ✅ **Fixed.** `TrackingMetadata` interface defined and used in `tracker.ts`. |
| #8 (LOW): setInterval leak | ✅ **Fixed.** `syncInterval` stored as class property, cleared before re-creation, guarded by `isInitialized`. |

---

## New Positive Observations (v2)

- ✅ **Server-side schema** (`school-schema.ts`) uses proper `decimal` types for lat/lng with precision, FK references to `teachers` and `schools`, and comprehensive indexes.
- ✅ **Schools table** now has `latitude`/`longitude` columns in `core-schema.ts` — necessary infrastructure for GPS validation.
- ✅ **Server-side distance recalculation** — the sync handler re-computes distances using school coordinates, fulfilling "Server validation is final authority" (§6).
- ✅ **Idempotent sync** — `onConflictDoNothing()` on insert prevents duplicate events.
- ✅ **Teacher identity validation** — server skips events where `teacherId` or `schoolId` doesn't match the authenticated context, preventing spoofing.
- ✅ **Reliability score computed server-side** and saved to the end event's metadata after sync.
- ✅ **Dynamic imports** for tracker in the session hook — keeps bundle lean.

---

## Spec Coverage Assessment (v2)

| Spec Requirement | Status | Notes |
| --- | --- | --- |
| §3.1 Time Reference System | ✅ Implemented | `time-sync.ts` with localStorage persistence |
| §3.2 Session Start Validation | ⚠️ Partial | Missing punctuality classification (on-time/late/significantly-late) at capture time |
| §3.3 GPS Validation | ✅ Implemented | School coords fetched, passed to tracker, Haversine validated client + server |
| §3.4 Random Presence Ping | ✅ Implemented | 15–20 min randomized intervals |
| §4 Data Persistence | ✅ Implemented | PGlite local storage + server-side Drizzle table |
| §5 Session End Handling | ⚠️ Partial | End event saved, but no local aggregation displayed to teacher |
| §6 Sync Workflow | ✅ Implemented | Server validates, recalculates distances, persists with `onConflictDoNothing` |
| §7 Reliability Score | ⚠️ Partial | Computed server-side but `officialStartTime` is wrong (= actualStartTime) |
| §9 App resume recovery | ✅ Implemented | localStorage persistence + ping loop resume |
| §9 Idempotent sync | ✅ Implemented | UUID primary keys + `onConflictDoNothing` |
| §9 Duplicate prevention | ✅ Implemented | UUID-based events + conflict resolution |

---

## Recommended Priority

1. **Fix Issue #1** (No-Throw violations) — Breaks project convention, causes unstructured 500s.
2. **Fix Issue #2** (`any` types in server function) — TypeScript strict mode violation on security path.
3. **Fix Issue #5** (officialStartTime) — Punctuality score is always 100, defeating its purpose.
4. **Fix Issue #3** (hardcoded "GPS") — i18n violation.
5. **Fix Issue #4** (non-null assertions) — Minor code quality.
