# Browser Testing AI Prompt Guide

## Overview

This document provides a comprehensive, hardened prompt system for AI-driven browser testing agents. It enforces a strict **check → verify → compare → fix → re-verify → continue** workflow that prevents blind continuation when errors occur.

---

## Core Operating Principles (Non-Negotiable Rules)

### Rule 1 — No Forward Progress With Red Status

> **The agent MUST NOT continue to another task if the current verification fails.**

* ❌ No "log and continue"
* ❌ No "note anomaly and move on"
* ✅ **Fix first, then re-check**

---

### Rule 2 — Step-by-Step Transactional Verification (STO)

Every task is treated as a **transaction**:

```text
CHECK → VERIFY → COMPARE → DECIDE → FIX (if needed) → RE-VERIFY → PASS → NEXT
```

If **PASS** is not achieved → the workflow is **blocked**.

---

### Rule 3 — UI ≠ Source of Truth

For every verification:

* UI behavior **must be compared** against:
  * Route definitions
  * RBAC / permission config
  * Sidebar config
  * Route guards
  * API permission checks

If UI ≠ code → **code wins**, UI must be fixed.

---

### Rule 4 — Restriction Flags Are Blocking Errors

If the agent sees:

* "You can't view"
* "You don't have permission"
* Disabled button
* Missing sidebar item
* Hidden action

👉 This is a **Restriction Flag**.

**Restriction Flag behavior:**

* 🚨 STOP immediately
* 🔧 Fix authorization / visibility / guard
* 🔁 Re-verify
* ✅ Only continue after pass

---

## STO Workflow (Structured Task Orchestration)

Each STO is **atomic** and **blocking**.

---

### STO 1 — Authentication & Role Context

**Goal:** Ensure the correct user and role context.

**Checks**

* User logged in with correct role
* Token valid
* Role correctly resolved backend + frontend

**Verification**

* Role visible in UI
* Role matches backend payload

**Decision**

* ❌ Mismatch → FIX auth / role resolution
* ✅ Match → STO 2

---

### STO 2 — Sidebar Integrity Check

**Goal:** Ensure full visibility.

**Checks**

* Extract all sidebar items from:
  * UI
  * Sidebar config
  * Route definitions

**Verification**

* UI sidebar ⟷ Code sidebar list
* No missing, extra, or hidden items

**Decision**

* ❌ Difference detected → FIX sidebar visibility logic
* ❌ Hidden item → FIX RBAC condition
* ✅ Identical → STO 3

---

### STO 3 — Sidebar Route Access (One by One)

For **each sidebar item**:

**Checks**

* Click sidebar item
* Route loads

**Verification**

* No 401 / 403
* No redirect to login
* No restriction message

**Decision**

* ❌ Restriction flag → FIX route guard / permission
* ❌ Broken route → FIX routing
* ✅ Pass → continue within same STO

⚠️ If **any** sidebar fails → STO 3 restarts after fix.

---

### STO 4 — Deep Navigation (Module-Level CRUD)

For each module (e.g., Teachers, Students, Classes):

**Checks**

1. List view loads
2. Row click navigates to detail view
3. Detail view loads
4. Edit action works
5. Delete action works
6. Create form works

**Verification**

* Action visible
* Action executable
* API accepts action
* Form submits successfully

**Decision**

* ❌ Action missing → FIX UI permission mapping
* ❌ API denied → FIX backend RBAC
* ❌ Form error → FIX validation/submission
* ✅ All actions pass → STO 5

---

### STO 5 — Protected Entity Rules (Security STO)

**Checks**

* Protected users (e.g., founders, system admins)
* Self-user row

**Verification**

* Protected entities:
  * No edit
  * No delete
  * No role change
* Self:
  * Cannot elevate to protected role

**Decision**

* ❌ Any violation → FIX immediately (security critical)
* ✅ Pass → STO 6

---

### STO 6 — Code vs Runtime Comparison

**Checks**

* Compare:
  * Route permissions
  * Frontend guards
  * Backend guards
  * RBAC config

**Verification**

* All permission sources aligned

**Decision**

* ❌ Drift detected → FIX the weakest link
* ✅ Pass → STO 7

---

### STO 7 — Regression Re-Scan (Mandatory)

**Checks**

* Re-run STO 2 → STO 5

**Verification**

* No regression introduced by fixes

**Decision**

* ❌ Regression → FIX and repeat
* ✅ Stable → END

---

## Decision Engine

This is the logic that **prevents blind continuation**.

### Decision Table (Mental Model)

| Condition                 | Action          |
| ------------------------- | --------------- |
| Verification failed       | STOP            |
| Restriction flag detected | FIX immediately |
| UI ≠ code                 | FIX UI          |
| API denies allowed action | FIX backend     |
| Fix applied               | RE-VERIFY       |
| Re-verify fails           | LOOP            |
| Re-verify passes          | CONTINUE        |

---

## Ready-to-Use Browser Agent Prompt

### 🔒 Self-Correcting Browser Audit Prompt

```markdown
You are a step-by-step verification and correction browser agent.
You MUST operate using STO (Structured Task Orchestration).

## Global Rules

* Never continue to another task if the current verification fails
* Every detected restriction flag is blocking and must be fixed immediately
* Always compare UI behavior with route config, RBAC, and code
* Fix → re-verify → only then continue
* Take screenshots at every verification step for evidence

## Execution Mode

* CHECK → VERIFY → COMPARE → DECIDE → FIX → RE-VERIFY → PASS → NEXT
* No logging-and-continuing behavior is allowed

## Scope

* Application URL: [INSERT URL]
* User role: [INSERT ROLE]
* Scope: [INSERT SCOPE]

## Restriction Flags (Blocking Errors)

* Missing sidebar item
* Disabled or hidden action button
* Permission error message
* Route denial (redirect, 401, 403)
* Role inconsistency
* Unexpected navigation

## Behavior on Restriction Flag

1. STOP current STO
2. Take screenshot as evidence
3. Identify root cause (UI, route guard, RBAC, API)
4. Report the issue with specific details
5. Wait for fix to be applied
6. Re-run the same STO from the beginning

## CRUD Verification Checklist

For each module, verify:

1. [ ] List view loads without errors
2. [ ] Table rows are clickable and navigate to detail page
3. [ ] Action menu opens without triggering row navigation
4. [ ] "Voir" (View) is NOT in action menu (redundant if row is clickable)
5. [ ] Edit action opens correct form
6. [ ] Create action opens correct form
7. [ ] Delete action shows confirmation dialog
8. [ ] Form submission succeeds with valid data
9. [ ] Form shows validation errors with invalid data
10. [ ] Protected entities cannot be modified

## Screenshot Requirements

* Take screenshot BEFORE each action
* Take screenshot AFTER each action
* Label screenshots with step number and action name

## Completion Condition

* All STOs pass without restriction flags
* UI, route config, and backend permissions are fully aligned
* All CRUD operations verified for accessible modules
```

---

## Example Task Prompt for Yeko Application

```markdown
## Task: Verify CRUD Operations for HR Module

### Prerequisites
- App URL: http://localhost:3001
- Role: school_director
- Assume: Already logged in

### Steps

#### STO 1: Verify Sidebar Navigation
1. Locate "Utilisateurs" in sidebar
2. Expand menu
3. Verify these items are visible:
   - Personnel
   - Enseignants
   - Rôles & Permissions
4. Take screenshot of expanded menu

#### STO 2: Verify Teachers Module
1. Navigate to "Enseignants" 
2. Verify table loads
3. Click on a teacher row (NOT the dots button)
4. Verify navigation to detail page
5. Take screenshot of detail page
6. Click back/breadcrumb to return to list
7. Click the action dots (⋮) button on a row
8. Verify dropdown opens WITHOUT triggering navigation
9. Verify "Voir" is NOT in the dropdown
10. Take screenshot of dropdown menu

#### STO 3: Test Create Form
1. Click "Ajouter un enseignant" button
2. Fill form with test data:
   - Name: Test Teacher
   - Email: test.teacher@example.com
   - (skip optional fields)
3. Submit form
4. Verify success or capture error
5. Take screenshot of result

#### STO 4: Repeat for Staff Module
(Same steps as Teachers)

#### STO 5: Repeat for Roles Module
(Same steps, note: roles may have additional restrictions)

### Stop Conditions
- Any navigation error
- Any permission denied message
- Any form that fails to load
- Any action button that doesn't work
```

---

## Integration with Skill System

This prompt guide follows the skill format used in `.agent/skills/`. To integrate:

1. Create directory: `.agent/skills/browser-testing-stos/`
2. Add `SKILL.md` with this content
3. Add individual STO files in `rules/` subdirectory
4. Reference in browser subagent tasks

### Skill Structure

```text
.agent/skills/browser-testing-stos/
├── SKILL.md           # This guide
├── AGENTS.md          # Full compiled rules document
└── rules/
    ├── sto-1-auth.md
    ├── sto-2-sidebar.md
    ├── sto-3-routes.md
    ├── sto-4-crud.md
    ├── sto-5-security.md
    ├── sto-6-comparison.md
    └── sto-7-regression.md
```

---

## Why This Works

### Problems This Solves

| Problem | Solution |
| --------- | ---------- |
| Agent continues despite errors | Blocking verification gates |
| Missed bugs due to speed | Screenshot evidence required |
| Inconsistent testing | Structured STO workflow |
| Forgotten edge cases | Comprehensive checklist |
| Security oversights | Dedicated security STO |

### Key Differentiators

1. **Blocking Gates**: Cannot proceed until current step passes
2. **Evidence-Based**: Screenshots prove completion
3. **Atomic Tasks**: Each STO is independent and complete
4. **Self-Correcting**: Fix → Re-verify loop
5. **Consistent**: Same workflow for every module

---

## Changelog

| Date | Version | Changes |
| ------ | --------- | --------- |
| 2026-02-04 | 1.0.0 | Initial version |

---

`Document created by AI Engineering Assistant for Yeko Project`
