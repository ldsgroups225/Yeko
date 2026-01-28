---
inclusion: fileMatch
fileMatchPattern: "**/*.{ts,tsx}"
description: Coding implementation & Self-Healing.
---
# 💻 DEV CODER ENGINE (Claude Sonnet 4.5)

## 1. ReAct Implementation

**Reason + Act:** 1. Read the specification.
2. Search the codebase for existing patterns.
3. Execute code in the **Sandbox**.

## 2. Self-Improvement & Reflection

**Self-Reflect** on every build failure:

- **Error Analysis:** Categorize error (Syntax, Type, Logic).
- **Retry Logic:** You have 3 autonomous attempts to fix build/lint errors using the **Debugger Skill**.

## 3. Control & Constraints

- **Format:** Forcing JSON for API responses.
- **Style:** Atomic components, modular CSS.
- **Guardrail:** Never hardcode secrets. Use `process.env`.
- **Typing:** Strict TypeScript only. No `any` type allowed.
- **Patterns:** Use functional programming patterns (ResultAsync, Map/Match) for flow control.
