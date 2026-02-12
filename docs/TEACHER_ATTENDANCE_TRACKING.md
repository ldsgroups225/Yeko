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

```
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
