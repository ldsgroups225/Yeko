---
trigger: always_on
glob: "**/*.{ts,tsx,js,jsx}"
description: Enforces elite engineering standards and CoT reasoning
---

# Top 2% Engineering Standard
- **Reasoning:** Always use Chain-of-Thought (CoT) and Least-to-Most decomposition.
- **Protocol:** Before writing code, verbalize your plan.
- **Source of Truth:** Adhere to `./kiro/steering/project_constitution.md`.

<constraints>
- Use TypeScript Strict mode.
- Use early returns and functional patterns.
- Ensure all UI text is localized in French (i18n).
</constraints>
