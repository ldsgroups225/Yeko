---
name: pr-review-workflow
description: >
  Automated pull request review and triage workflow for Yeko AI agents such as Claude Code, Codex,
  Anti-gravity, and similar tools. Use this skill whenever an agent must review one or more open pull requests,
  compare them against the current `origin/master`, and decide whether to merge, fix then merge, close, or skip.
  Triggers on requests like "review my PRs", "triage open pull requests", "clean up PRs", "review and merge PRs",
  or any autonomous PR processing task in this workspace.
---

# PR Review Workflow

Use this skill for autonomous PR review in Yeko. The output is not just review comments: the agent must decide one of four actions for each open PR:

- `merge`
- `fix -> merge`
- `close`
- `skip`

## Required Yeko Context

Before reviewing any PR:

1. Read `/home/darius-kassi/Projects/Yeko/AGENTS.md`.
2. Read the touched app or package `AGENTS.md`.
3. Read `/home/darius-kassi/Projects/Yeko/.agent/rules/pr-review-triage.md`.
4. Treat `master` as the default base branch unless the PR explicitly targets another base.

## Workflow

### Fast path with the bundled script

Use the bundled script when you need a first pass across every open PR:

```bash
python3 .agents/skills/pr-review-workflow/scripts/triage_open_prs.py
```

Useful options:

```bash
python3 .agents/skills/pr-review-workflow/scripts/triage_open_prs.py --limit 10
python3 .agents/skills/pr-review-workflow/scripts/triage_open_prs.py --write-report docs/pr-triage-report.md
python3 .agents/skills/pr-review-workflow/scripts/triage_open_prs.py --execute --confirm
```

The script is conservative:

- default mode is analysis only
- `fix -> merge` is reported but not auto-applied
- `merge` and `close` are executed only with `--execute --confirm`

### Phase 1: collect open PRs

Preferred command:

```bash
gh pr list --state open --json number,title,author,baseRefName,headRefName,isDraft,labels,createdAt,additions,deletions,changedFiles
```

Then inspect each candidate:

```bash
gh pr view <PR_NUMBER> --json title,body,files,reviews,comments,labels,isDraft,baseRefName,headRefName
```

If `gh` is unavailable, use `git fetch` plus the GitHub API.

### Phase 2: review each PR against current reality

For each PR:

1. Fetch the branch locally.
2. Compare it with current `origin/master`.
3. Read the changed files and nearby code, not just the diff.
4. Run targeted validation for the changed slice.

Useful commands:

```bash
git fetch origin master
git fetch origin pull/<PR_NUMBER>/head:pr-<PR_NUMBER>
git diff --stat origin/master...pr-<PR_NUMBER>
git diff origin/master...pr-<PR_NUMBER>
pnpm exec eslint <changed-files...>
git diff --check origin/master...pr-<PR_NUMBER>
```

Do not over-trust full repo lint or pre-push hooks when they fail because of unrelated baseline debt. Judge the PR delta separately and document the distinction.

### Phase 3: apply the decision tree

Use these decisions in order:

1. `skip`
2. `close`
3. `fix -> merge`
4. `merge`

#### `skip`

Skip the PR if any of these are true:

- draft PR
- label `wip`, `hold`, or `do-not-merge`
- active human review is clearly in progress and the PR is waiting on people, not code

#### `close`

Close the PR if any of these are true:

- hardcoded secrets, credentials, or unsafe auth/security patterns
- multi-tenant isolation is broken or missing `schoolId` scoping
- `packages/data-ops` breaks the No-Throw `ResultAsync` contract
- undocumented risky DB or auth changes
- trivial or cosmetic-only change with no meaningful product value
- stale PR with low signal and no clear path to safe completion
- fix is larger than one focused agent pass

Leave a short closure comment with the reason.

#### `fix -> merge`

Choose this when the product value is real and the remaining issues are small:

- naming
- missing `aria-label`
- minor lint/type issues
- missing i18n usage
- small import or Result-handling cleanup

Repair on the PR branch, commit the changes, re-run targeted validation, then merge.

#### `merge`

Choose this only if all of these hold:

- useful, visible, or operationally meaningful change
- no critical security, tenancy, auth, or schema risk
- aligned with Yeko conventions
- targeted validation is clean enough to justify landing it

If publication is blocked only by known unrelated repo-wide hooks, document that and use judgment. In this workspace, a hook bypass may be acceptable only after the PR itself has been reviewed as safe and the hook failure is demonstrably unrelated.

## Yeko-specific checks

Always check for:

- tenant scoping on school data
- Zod validation on user inputs
- Better Auth session requirements for mutations
- `ResultAsync` and `DatabaseError` handling in `packages/data-ops`
- i18n usage instead of hardcoded UI strings
- `SelectTrigger` labels showing human text rather than IDs
- `motion/react` using `domAnimation`, not `domMax`
- no edits to generated files

## References

Open these only when needed:

- `references/yeko-style.md`
- `references/decision-examples.md`
- `scripts/triage_open_prs.py`
