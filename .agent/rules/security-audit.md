---
trigger: always_on
glob: "packages/data-ops/**/*, apps/**/*"
description: Prevents multi-tenant data leakage and security vulnerabilities
---

# Security & RLS Guardrail

- **Context:** Refer to `./.kiro/steering/security_auditor_steering.md`.
- **Tenant Isolation:** Every DB query involving schools MUST include `where(eq(table.schoolId, ctx.schoolId))`.
- **Input Safety:** Validate every user input with Zod schemas.

<critical_warning>

- Never commit hardcoded API keys or credentials.
- Block any action that mutates the database without school_id scoping.
</critical_warning>
