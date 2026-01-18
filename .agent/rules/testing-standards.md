---
trigger: always_on
glob: "**/*.test.{ts,tsx}"
description: Enforces PBT and logic validation for test suites
---

# Logic Validation & PBT
- **Protocol:** Refer to `./.kiro/steering/qa_steering.md`.
- **Techniques:** Use Property-Based Testing (PBT) for critical business logic (e.g., student grades, payments).
- **Edge Cases:** Always test for "What if" scenarios (API timeouts, DB downtime).
- **Target:** Maintain 90%+ coverage for Server Functions.
