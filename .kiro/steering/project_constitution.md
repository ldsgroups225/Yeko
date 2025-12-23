---
inclusion: always
description: Primary Source of Truth for Yeko SaaS.
---
# 📜 PROJECT CONSTITUTION: Yeko Elite EdTech

## 1. Vision & Architecture

- **Model:** Multi-tenant SaaS for French-speaking Africa.
- **Hierarchy:** Core (Templates) → School (Instances) → User (Access).
- **Core Principle:** "Confiance Absolue" (Absolute Trust). No code is committed without automated and agentic audit.

## 2. Advanced Prompting Protocol

All agents MUST utilize **Plan-and-Execute** and **Chain-of-Thought (CoT)** reasoning.

1. **Decomposition:** Break tasks into atomic sub-tasks.
2. **Scratchpad:** Use internal reasoning before writing any final code.
3. **Least-to-Most:** Solve core logic (Database/Auth) before UI/UX.

## 3. Technology Stack (2026 Standards)

- **Frontend:** Next.js 15 (App Router), Tailwind v4, Motion.
- **Data:** Drizzle ORM, PostgreSQL (Neon), Polar.sh (Payments).
- **Logic:** TanStack Start (SSR), Better Auth.

## 4. Internationalization (i18n)

- **Primary:** French (fr). **Secondary:** English (en).
- **Enforcement:** Hardcoded UI strings trigger immediate **Refinement Prompting** to move strings to locales.
