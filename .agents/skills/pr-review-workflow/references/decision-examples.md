# Decision Examples For Yeko PR Triage

Use these examples when a PR sits between two possible outcomes.

## Merge

### Case: small but real accessibility fix

PR:
- adds missing `aria-label` values to icon-only buttons in a teacher route
- no business logic changes
- targeted lint on touched files passes

Decision:
- `merge`

Reason:
- low risk, real accessibility value, consistent with workspace patterns

## Fix -> Merge

### Case: useful feature with small correctness debt

PR:
- adds a school dashboard filter that users can see and use
- includes one `any`, one hardcoded French string, and one forgotten `console.log`

Decision:
- `fix -> merge`

Repair:
- replace `any`
- move text into i18n
- remove the log

## Close

### Case: unsafe tenant access

PR:
- introduces a query on school-scoped data without `schoolId` filtering

Decision:
- `close`

Reason:
- multi-tenant leakage risk is a hard stop in Yeko

### Case: no meaningful value

PR:
- renames comments, changes spacing, or swaps icon sizes without visible or operational value

Decision:
- `close`

Reason:
- repository churn without product value

### Case: too large for autonomous repair

PR:
- touches auth, payments, schema, and UI together
- missing tests and unclear intent

Decision:
- `close`

Reason:
- too much ambiguity and risk for autonomous handling

## Skip

### Case: explicit no-touch PR

PR:
- draft or labeled `wip`, `hold`, or `do-not-merge`

Decision:
- `skip`

Reason:
- the workflow should not interfere with intentional human sequencing
