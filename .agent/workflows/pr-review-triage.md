---
description: Iterative workflow for reviewing all open GitHub pull requests in Yeko and deciding merge, fix-then-merge, close, or skip.
---

# Yeko Open PR Triage Workflow

Steps:
1. Read `./AGENTS.md`, `./.agent/rules/pr-review-triage.md`, and the subtree `AGENTS.md` for touched areas.
2. Fetch `origin/master` and list open PRs with `gh pr list --state open`.
3. Skip any PR that is draft or has label `wip`, `hold`, or `do-not-merge`.
4. For each remaining PR:
   - fetch the PR branch locally
   - diff it against `origin/master`
   - inspect touched code paths and project-specific constraints
   - run targeted validation for changed files or affected package
5. Decide exactly one action:
   - `merge` if the PR is useful, safe, and already compliant
   - `fix -> merge` if the value is real and the fix is small enough for one agent pass
   - `close` if the PR is risky, low-value, stale, or too expensive to repair safely
   - `skip` if the PR should remain untouched for human or workflow reasons
6. When fixing:
   - edit on the PR branch
   - commit the repair
   - re-run targeted validation
   - merge only after the fix is confirmed
7. When closing:
   - leave a short comment with the exact reason
8. When global hooks fail because of unrelated baseline repo debt, document that clearly instead of blaming the PR.
9. End with a Markdown report covering every open PR and the action taken.
