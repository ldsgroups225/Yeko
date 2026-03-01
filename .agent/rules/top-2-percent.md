---
trigger: always_on
description: Enforces elite engineering standards and CoT reasoning
---

# Top 2% Engineering Standard

- **Reasoning:** Always use Chain-of-Thought (CoT) and Least-to-Most decomposition.
- **Protocol:** Before writing code, verbalize your plan.
- **Source of Truth:** Adhere to `./.kiro/steering/project_constitution.md`.

<constraints>
- Use TypeScript Strict mode, avoid type "any" and avoid force casting (pefer inherit).
- Use early returns and functional patterns.
- Ensure all UI text is localized in French/English (i18n).
- **Data Layer:** Use `ResultAsync` pattern; NEVER throw raw exceptions.
- **Error Logging:** Always attach `tapLogErr` to data operations.
</constraints>
