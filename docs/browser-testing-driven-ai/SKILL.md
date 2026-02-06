---
name: browser-testing-stos
description: Structured Task Orchestration (STO) workflow for AI-driven browser testing. Use this skill when performing automated UI verification, CRUD testing, or navigation audits. Ensures systematic verification with blocking gates that prevent continuation on failure.
license: MIT
metadata:
  author: Yeko Engineering
  version: "1.0.0"
---

# Browser Testing STOs Skill

A comprehensive skill for AI browser agents to perform systematic, self-correcting UI verification with the STO (Structured Task Orchestration) methodology.

## When to Apply

Reference these guidelines when:

- Performing automated browser testing
- Verifying CRUD operations across modules
- Auditing navigation and routing
- Testing role-based access control (RBAC)
- Validating UI against code specifications

## Core Principles

| Principle | Description |
| ----------- | ------------- |
| No Forward Progress With Red Status | Never continue if current verification fails |
| Transactional Verification | CHECK → VERIFY → COMPARE → DECIDE → FIX → RE-VERIFY → PASS → NEXT |
| UI ≠ Source of Truth | Always compare UI behavior against code |
| Restriction Flags Are Blocking | Any permission/access error blocks progress |

## STO Categories

| STO | Name | Priority | Purpose |
| ----- | ------ | ---------- | --------- |
| 1 | Authentication & Role | CRITICAL | Verify correct user context |
| 2 | Sidebar Integrity | CRITICAL | Verify menu visibility |
| 3 | Route Access | HIGH | Verify navigation works |
| 4 | CRUD Operations | HIGH | Verify all actions work |
| 5 | Protected Entities | CRITICAL | Verify security rules |
| 6 | Code Comparison | MEDIUM | Verify UI matches code |
| 7 | Regression Scan | MEDIUM | Verify no regressions |

## Quick Reference

### STO 1 — Authentication

- Verify user is logged in with correct role
- Verify role is displayed correctly in UI
- Verify token is valid

### STO 2 — Sidebar

- Extract all sidebar items from UI
- Compare against sidebar config in code
- Verify no missing or hidden items

### STO 3 — Routes

- Click each sidebar item
- Verify route loads without error
- Verify no permission denied messages

### STO 4 — CRUD

- Test List view
- Test row click navigation
- Test action menu (no duplicate navigation)
- Test Create form
- Test Edit form
- Test Delete action

### STO 5 — Security

- Verify protected users cannot be modified
- Verify role escalation is blocked
- Verify founder/admin protection

### STO 6 — Comparison

- Compare UI permissions with route config
- Compare UI permissions with backend guards
- Identify and fix any drift

### STO 7 — Regression

- Re-run STOs 2-5 after any fix
- Verify no new issues introduced

## Decision Rules

| Condition | Action |
| ----------- | -------- |
| Verification failed | STOP |
| Restriction flag detected | FIX immediately |
| UI ≠ code | FIX UI |
| API denied | FIX backend |
| Fix applied | RE-VERIFY |
| Re-verify fails | LOOP |
| Re-verify passes | CONTINUE |

## Restriction Flags

These conditions BLOCK progress:

- Missing sidebar item
- Disabled action button
- Permission error message
- Route denial (401, 403, redirect)
- Unexpected navigation
- Form load failure

## Screenshot Requirements

Always capture screenshots:

- Before each action
- After each action
- On any error
- At completion of each STO

## Full Documentation

See `BROWSER_TESTING_PROMPT_GUIDE.md` in the same directory for:

- Complete STO specifications
- Ready-to-use prompt templates
- Example task prompts
- Integration instructions

## Usage Example

```markdown
## Task: Verify Teachers Module

Using STO workflow:

1. STO 3: Navigate to /users/teachers
2. STO 4: Verify CRUD operations
   - [ ] List loads
   - [ ] Row click navigates
   - [ ] Action menu works
   - [ ] Create form works
   - [ ] Edit form works
   - [ ] Delete works
3. Take screenshots at each step
4. Report any restriction flags
```
