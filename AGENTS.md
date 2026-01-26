# Yeko Project Intelligence Bridge

This project uses a dual-IDE setup (Kiro & Windsurf). The absolute "Source of Truth" for architectural patterns, security protocols, and engineering standards is located in the `./.kiro/` directory.

## Core Protocols

When acting as Cascade, you MUST strictly adhere to the instructions found in:

- **Architecture & Ethics:** refer to `./.kiro/steering/project_constitution.md`
- **Development Standards:** refer to `./.kiro/steering/dev_coder_steering.md`
- **Security Protocols:** refer to `./.kiro/steering/security_auditor_steering.md`

## Multi-Agent Behavior

Cascade should emulate the specialized roles defined in `.kiro/subagents/`. If a task requires deep architectural planning, adopt the persona in `./.kiro/steering/architect_steering.md`.

## Language Policy

- **French-First:** All UI strings must be localized using the i18n patterns defined in project specs. Hardcoding is prohibited.

## UI/UX Standards

- **Select Component Labels:** When using `Select` components, the `SelectTrigger` MUST display the human-readable label (e.g., name, title) of the selected item, NEVER the internal ID or raw value (like `__none__`).
  - **Implementation:** Explicitly pass the resolved label as children to `SelectValue`.
  - **Example:** `<SelectValue>{items.find(i => i.id === value)?.name}</SelectValue>` instead of `<SelectValue />`.

## Database Protocols

- **Neon HTTP Driver:** AVOID transactions when using neon-http driver. The driver doesn't support database transactions and will throw "No transactions support in neon-http driver" errors.
- **Transaction Alternatives:** Use sequential database operations instead of transactions. For batch operations, prepare data in memory first, then execute individual queries.
- **Driver Detection:** The project automatically uses neon-http for Neon connections (contains `.neon.tech` or `sslmode=`) and standard PostgreSQL for other connections.

## Vite & SSR Protocols

- **Dependency Optimization:** Inclusion of legacy CommonJS modules and core TanStack libs in `ssr.noExternal` and `optimizeDeps.include` is MANDATORY to prevent "No matching export" and duplicate context errors.

## AI Development Workflow Analysis

## Overview

This standardized, reproducible AI-assisted development workflow enforces quality checks and standardizes the implementation process using the `git_workflow_orchestrator.py` script.

### Three-Phase Development Process

The workflow is divided into three distinct phases:

- **Phase A: Define (PRD & Tasks)**
  - Goal: Clear requirements and a step-by-step implementation plan.
  - Tools: Use `agent-template/create-prd.md` and `agent-template/generate-tasks.md`.
- **Phase B: Implementation**
  - Goal: Incremental coding of the defined tasks.
- **Phase C: Verification & Finalization**
  - Goal: Ensure code quality and automate the commit preparation.
  - Tools: `./git_workflow_orchestrator.py`.

## Reproducibility Steps

1. **Define the work:**

   ```text
   Use agent-template/create-prd.md to define the feature.
   Use agent-template/generate-tasks.md to create the plan.
   ```

2. **Implement the code changes.**
3. **Run the quality gate:**

   ```bash
   chmod +x git_workflow_orchestrator.py
   # For a feature:
   ./git_workflow_orchestrator.py feat
   # For a bug fix:
   ./git_workflow_orchestrator.py bug
   # For a read-only check:
   ./git_workflow_orchestrator.py review
   ```

4. **Follow the orchestrator's output:** If it succeeds, it will provide a suggested commit message and summary.

<!--AGENT_WORKFLOWS_START-->
```yaml
agents:
  - name: review
    description: "Read-only quality checks for code reviews"
    steps:
      - name: "Git Status"
        function: "check_git_status"
      - name: "Type Check"
        function: "run_typecheck_readonly"
      - name: "Linting"
        function: "run_lint_readonly"
      - name: "Tests"
        function: "run_tests_readonly"

  - name: feat
    alias: feature
    description: "Full workflow for new features with automated fixes"
    steps:
      - name: "Initial Status"
        function: "check_git_status"
      - name: "Type Check"
        function: "run_typecheck_fix"
      - name: "Lint & Fix"
        function: "run_lint_fix"
      - name: "Tests"
        function: "run_tests_with_retry"
      - name: "Final Status"
        function: "check_final_status"
      - name: "Suggest Commit"
        function: "suggest_commit_message"

  - name: bug
    alias: fix
    description: "Workflow for bug fixes with automated fixes"
    steps:
      - name: "Initial Status"
        function: "check_git_status"
      - name: "Type Check"
        function: "run_typecheck_fix"
      - name: "Lint & Fix"
        function: "run_lint_fix"
      - name: "Tests"
        function: "run_tests_with_retry"
      - name: "Final Status"
        function: "check_final_status"
      - name: "Suggest Commit"
        function: "suggest_commit_message"
```
<!--AGENT_WORKFLOWS_END-->
