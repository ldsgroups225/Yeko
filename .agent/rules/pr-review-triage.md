---
trigger: manual
glob: "**/*"
description: Review and triage open pull requests against Yeko's real workspace rules before merge, fix, close, or skip.
---

# Open PR Triage Guardrail

- Before touching any PR, read `./AGENTS.md` and the relevant subtree `AGENTS.md`.
- Default base branch for this repository is `master`, not `main`.
- Review the PR against current `origin/master`, not against memory.
- Do not auto-merge code that violates Yeko critical rules:
  - multi-tenant school data must stay scoped by `schoolId`
  - `packages/data-ops` must follow the No-Throw `ResultAsync` pattern
  - UI strings must use project i18n patterns
  - auto-generated files such as `routeTree.gen.ts` and `i18n-types.ts` must not be edited
- Do not force-close or force-merge a PR only because global repo hooks are red from unrelated existing debt. Judge the delta first.
- If a PR is useful and safe but blocked only by unrelated baseline hook failures, `fix -> merge` or `merge` may still be valid with explicit documentation.
- Skip PRs labeled `wip`, `hold`, or `do-not-merge`.
- Close PRs with hardcoded secrets, unsafe auth/security changes, undocumented breaking schema changes, or no meaningful product value.
