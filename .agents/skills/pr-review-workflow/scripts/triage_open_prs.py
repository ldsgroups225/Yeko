#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[4]
BASE_BRANCH = "master"
SKIP_LABELS = {"wip", "hold", "do-not-merge"}
MAX_FIXABLE_FILES = 8
MAX_FIXABLE_CHANGED_LINES = 120
STALE_DAYS = 30


@dataclass
class Decision:
    action: str
    reason: str
    notes: list[str] = field(default_factory=list)


def run(cmd: list[str], check: bool = True) -> str:
    result = subprocess.run(
        cmd,
        cwd=REPO_ROOT,
        text=True,
        capture_output=True,
    )
    if check and result.returncode != 0:
        message = result.stderr.strip() or result.stdout.strip() or "command failed"
        raise RuntimeError(f"{' '.join(cmd)}: {message}")
    return result.stdout


def run_optional(cmd: list[str]) -> tuple[int, str, str]:
    result = subprocess.run(
        cmd,
        cwd=REPO_ROOT,
        text=True,
        capture_output=True,
    )
    return result.returncode, result.stdout, result.stderr


def gh_json(args: list[str]) -> Any:
    output = run(["gh", *args])
    return json.loads(output)


def iso_age_days(value: str) -> int:
    created = datetime.fromisoformat(value.replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    return max(0, (now - created).days)


def fetch_pr_branch(number: int) -> str:
    local_branch = f"pr-{number}"
    run(["git", "fetch", "origin", f"pull/{number}/head:{local_branch}"])
    return local_branch


def get_diff_files(branch: str) -> list[str]:
    output = run(["git", "diff", "--name-only", f"origin/{BASE_BRANCH}...{branch}"])
    return [line.strip() for line in output.splitlines() if line.strip()]


def get_diff_patch(branch: str) -> str:
    return run(["git", "diff", f"origin/{BASE_BRANCH}...{branch}"])


def get_diff_check(branch: str) -> tuple[bool, str]:
    code, stdout, stderr = run_optional(["git", "diff", "--check", f"origin/{BASE_BRANCH}...{branch}"])
    text = (stdout + stderr).strip()
    return code == 0, text


def get_behind_count(branch: str) -> int:
    output = run(["git", "rev-list", "--left-right", "--count", f"origin/{BASE_BRANCH}...{branch}"])
    left, right = output.strip().split()
    _ahead = int(left)
    behind = int(right)
    return behind


def targeted_eslint(files: list[str]) -> tuple[bool | None, str]:
    lintable = [f for f in files if f.endswith((".ts", ".tsx", ".js", ".jsx"))]
    if not lintable:
        return None, "No JS/TS files changed."

    cmd = ["pnpm", "exec", "eslint", *lintable]
    code, stdout, stderr = run_optional(cmd)
    text = (stdout + stderr).strip()
    return code == 0, text or "Targeted ESLint passed."


def classify(pr: dict[str, Any], branch: str) -> Decision:
    labels = {label["name"].lower() for label in pr.get("labels", [])}
    changed_files = get_diff_files(branch)
    diff_patch = get_diff_patch(branch)
    diff_ok, diff_check_output = get_diff_check(branch)
    eslint_ok, eslint_output = targeted_eslint(changed_files)
    age_days = iso_age_days(pr["createdAt"])
    changed_line_count = int(pr.get("additions", 0)) + int(pr.get("deletions", 0))
    behind_count = get_behind_count(branch)

    notes: list[str] = []

    if pr.get("isDraft") or labels & SKIP_LABELS:
        label_text = ", ".join(sorted(labels & SKIP_LABELS)) or "draft"
        return Decision("skip", f"PR intentionally not ready: {label_text}.")

    lower_patch = diff_patch.lower()
    lower_files = {Path(path).name.lower(): path for path in changed_files}

    secret_markers = [
        "api_key",
        "secret",
        "token",
        "password",
        "private_key",
        "ghp_",
        "sk-",
    ]
    if any(marker in lower_patch for marker in secret_markers):
        return Decision("close", "Potential hardcoded secret or credential detected.")

    if any(path.endswith((".env", ".env.local", ".env.production")) for path in changed_files):
        return Decision("close", "Environment file change detected in PR.")

    if any(path.endswith(("routeTree.gen.ts", "i18n-types.ts")) for path in changed_files):
        return Decision("close", "Generated files were manually modified.")

    if "package.json" in lower_files or "pnpm-workspace.yaml" in changed_files:
        notes.append("Dependency or workspace manifest changed; require extra scrutiny.")

    if "packages/data-ops/" in "\n".join(changed_files):
        if "throw " in diff_patch and "ResultAsync" not in diff_patch:
            return Decision("close", "data-ops diff suggests raw throw usage.")
        notes.append("Touches data-ops; verify ResultAsync and tenant safety carefully.")

    if "schoolid" in lower_patch and "where(eq(" not in lower_patch:
        notes.append("Potential school-scoped query change; verify tenant filtering manually.")

    if behind_count > 20:
        notes.append(f"Branch is {behind_count} commits behind origin/{BASE_BRANCH}.")

    if not diff_ok:
        notes.append(f"`git diff --check` failed: {diff_check_output}")

    if eslint_ok is False:
        notes.append("Targeted ESLint failed on changed files.")
    elif eslint_ok is True:
        notes.append("Targeted ESLint passed.")

    trivial = changed_line_count <= 6 and len(changed_files) <= 2 and "feat:" not in pr["title"].lower()
    if trivial and not any(path.endswith(".md") is False for path in changed_files):
        return Decision("close", "Trivial documentation-only change with low product value.", notes)

    if age_days > STALE_DAYS and changed_line_count <= 20:
        return Decision("close", f"Open for {age_days} days with low signal.", notes)

    if changed_line_count > 400 or len(changed_files) > 20:
        return Decision("close", "Too broad for safe autonomous triage.", notes)

    fixable = (
        changed_line_count <= MAX_FIXABLE_CHANGED_LINES
        and len(changed_files) <= MAX_FIXABLE_FILES
        and (
            (eslint_ok is False)
            or any("aria-label" in note.lower() for note in notes)
            or any(keyword in lower_patch for keyword in ["console.log", ": any", "dommax", "<selectvalue />"])
        )
    )
    if fixable:
        return Decision("fix -> merge", "Useful PR with bounded repair scope.", notes)

    if diff_ok and eslint_ok in (True, None):
        return Decision("merge", "Useful PR with no blocking issues found in targeted checks.", notes)

    return Decision("skip", "Needs manual review; automated heuristics are not decisive.", notes)


def close_pr(number: int, reason: str) -> None:
    comment = (
        "Fermé automatiquement après review par agent IA.\n"
        f"Raison : {reason}\n"
        f"Créé par : pr-review-workflow le {datetime.now().date().isoformat()}"
    )
    run(["gh", "pr", "close", str(number), "--comment", comment])


def merge_pr(number: int, title: str) -> None:
    subject = f"chore: merge PR #{number} - {title}"
    run(["gh", "pr", "merge", str(number), "--merge", "--subject", subject])


def render_report(results: list[tuple[dict[str, Any], Decision]]) -> str:
    counts = {"merge": 0, "fix -> merge": 0, "close": 0, "skip": 0}
    for _, decision in results:
        counts[decision.action] += 1

    lines = [
        f"# Rapport de Review PR - {datetime.now().date().isoformat()}",
        "",
        "## Resume",
        "| Action | Nombre |",
        "|--------|--------|",
        f"| merge | {counts['merge']} |",
        f"| fix -> merge | {counts['fix -> merge']} |",
        f"| close | {counts['close']} |",
        f"| skip | {counts['skip']} |",
        "",
        "## Details",
        "",
    ]

    for action in ("merge", "fix -> merge", "close", "skip"):
        lines.append(f"### {action}")
        action_items = [(pr, decision) for pr, decision in results if decision.action == action]
        if not action_items:
            lines.append("- None")
            lines.append("")
            continue
        for pr, decision in action_items:
            lines.append(f"- PR #{pr['number']} - `{pr['title']}`")
            lines.append(f"  - Reason: {decision.reason}")
            for note in decision.notes:
                lines.append(f"  - Note: {note}")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Review and triage open Yeko PRs.")
    parser.add_argument("--limit", type=int, default=100, help="Maximum number of open PRs to inspect.")
    parser.add_argument("--write-report", type=Path, help="Write Markdown report to this path.")
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Apply merge or close decisions with gh after analysis.",
    )
    parser.add_argument(
        "--confirm",
        action="store_true",
        help="Required together with --execute.",
    )
    args = parser.parse_args()

    if args.execute and not args.confirm:
        print("Refusing to execute without --confirm.", file=sys.stderr)
        return 2

    try:
        run(["gh", "auth", "status"])
        run(["git", "fetch", "origin", BASE_BRANCH])
        prs = gh_json(
            [
                "pr",
                "list",
                "--state",
                "open",
                "--limit",
                str(args.limit),
                "--json",
                "number,title,author,baseRefName,headRefName,isDraft,labels,createdAt,additions,deletions,changedFiles",
            ]
        )
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        return 1

    results: list[tuple[dict[str, Any], Decision]] = []

    for pr in prs:
        if pr.get("baseRefName") and pr["baseRefName"] != BASE_BRANCH:
            decision = Decision("skip", f"Base branch is `{pr['baseRefName']}`, not `{BASE_BRANCH}`.")
            results.append((pr, decision))
            continue

        try:
            branch = fetch_pr_branch(int(pr["number"]))
            decision = classify(pr, branch)
        except Exception as exc:
            decision = Decision("skip", f"Analysis failed: {exc}")

        results.append((pr, decision))

    report = render_report(results)
    print(report)

    if args.write_report:
        args.write_report.parent.mkdir(parents=True, exist_ok=True)
        args.write_report.write_text(report)

    if args.execute:
        for pr, decision in results:
            if decision.action == "merge":
                merge_pr(int(pr["number"]), pr["title"])
            elif decision.action == "close":
                close_pr(int(pr["number"]), decision.reason)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
