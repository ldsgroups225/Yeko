#!/usr/bin/env python3
"""
Agent-Driven Git Development Workflow Orchestrator
Reads workflow configuration from CLAUDE.md and executes it.
"""

import subprocess
import sys
import time
import re
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Callable

try:
    import yaml
except ImportError:
    print("Error: PyYAML package not found.", file=sys.stderr)
    print("Please install it by running: pip install PyYAML", file=sys.stderr)
    sys.exit(1)

from enum import Enum

class WorkflowState(Enum):
    INIT = "init"
    GIT_STATUS_CHECK = "git_status_check"
    TYPECHECK = "typecheck"
    LINT = "lint"
    TEST = "test"
    FINAL_STATUS = "final_status"
    COMMIT_MESSAGE = "commit_message"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class WorkflowContext:
    current_state: WorkflowState
    request_type: str
    initial_git_status: str = ""
    last_commit: str = ""
    attempts: Dict[str, int] = field(default_factory=lambda: {"typecheck": 0, "lint": 0, "test": 0})
    max_attempts: int = 3
    errors: List[str] = field(default_factory=list)

class AgentWorkflowOrchestrator:
    def __init__(self, request_type: str, config_file: str = "AGENTS.md", max_fix_attempts: int = 3):
        self.context = WorkflowContext(
            current_state=WorkflowState.INIT,
            request_type=request_type,
            max_attempts=max_fix_attempts
        )
        self.workflow_steps = self._load_workflow_from_config(config_file)

    def _load_workflow_from_config(self, config_file: str) -> List[Tuple[Callable, str]]:
        print(f"📄 Loading workflows from {config_file}...")
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            match = re.search(r'<!--AGENT_WORKFLOWS_START-->(.*)<!--AGENT_WORKFLOWS_END-->', content, re.DOTALL)
            if not match:
                print(f"Error: Could not find workflow block in {config_file}", file=sys.stderr)
                sys.exit(1)

            yaml_content = re.sub(r'```yaml|```', '', match.group(1)).strip()
            config = yaml.safe_load(yaml_content)
            
            agent_config = next((agent for agent in config.get('agents', []) if agent['name'] == self.context.request_type or agent.get('alias') == self.context.request_type), None)
            
            if not agent_config:
                print(f"⚠️ Agent '{self.context.request_type}' not found. Defaulting to 'review'.")
                self.context.request_type = 'review'
                return self._load_workflow_from_config(config_file)

            print(f"🤖 Initializing '{agent_config['name']}' agent: {agent_config['description']}")
            
            steps = []
            for step in agent_config.get('steps', []):
                func = getattr(self, step['function'], None)
                if callable(func):
                    steps.append((func, step['name']))
                else:
                    print(f"Error: Function '{step['function']}' not found.", file=sys.stderr)
                    sys.exit(1)
            return steps

        except FileNotFoundError:
            print(f"Error: Config file '{config_file}' not found.", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f"Error parsing workflow config: {e}", file=sys.stderr)
            sys.exit(1)

    def run_command(self, cmd: List[str]) -> Tuple[int, str, str]:
        try:
            process = subprocess.run(cmd, capture_output=True, text=True, check=False, timeout=600)
            return process.returncode, process.stdout, process.stderr
        except FileNotFoundError:
            return -2, "", f"Command not found: {cmd[0]}"
        except Exception as e:
            return -1, "", str(e)

    def check_git_status(self) -> bool:
        self.context.current_state = WorkflowState.GIT_STATUS_CHECK
        print("\n🔍 Checking Git Status...")
        code, status, err = self.run_command(["git", "status", "--short"])
        if code != 0:
            self.context.errors.append(f"Git status failed: {err}")
            return False
        self.context.initial_git_status = status
        print(f"📊 Git Status:\n{status or 'Working tree clean'}")
        return True

    def run_typecheck_readonly(self) -> bool:
        self.context.current_state = WorkflowState.TYPECHECK
        print("\n🔎 Running Type Check (Read-only)...")
        self.context.attempts['typecheck'] += 1
        code, stdout, stderr = self.run_command(["pnpm", "run", "typecheck"])
        if code == 0:
            print("✅ Type check passed.")
            return True
        print(f"❌ Type errors found:\n{(stdout + stderr)[:1000]}")
        self.context.errors.append("Type checking failed.")
        return True # In review mode, we report errors but don't fail the workflow

    def run_typecheck_fix(self) -> bool:
        # Most type checkers don't auto-fix, so this is an alias for the readonly check
        return self.run_typecheck_readonly()

    def run_lint_readonly(self) -> bool:
        self.context.current_state = WorkflowState.LINT
        print("\n🧹 Running Linter (Read-only)...")
        self.context.attempts['lint'] += 1
        # Create a non-fixing version of the command if one doesn't exist
        lint_cmd = ["pnpm", "run", "lint:check"]
        code, stdout, stderr = self.run_command(lint_cmd)
        if code == 0:
            print("✅ Linting passed.")
            return True
        print(f"❌ Lint issues found:\n{(stdout + stderr)[:1000]}")
        self.context.errors.append("Linting issues found.")
        return True

    def run_lint_fix(self) -> bool:
        self.context.current_state = WorkflowState.LINT
        print("\n- 🧹 Running Linter (with Fixes)...")
        self.context.attempts['lint'] += 1
        code, stdout, stderr = self.run_command(["pnpm", "run", "lint"]) # Your script is already aliased to lint:fix
        if code == 0 and not stderr:
            print("✅ Linting passed and/or auto-fixed.")
            return True
        
        if self.context.attempts['lint'] >= self.context.max_attempts:
            self.context.errors.append("Linting failed after max attempts.")
            return False
        
        print("- ⚠️ Lint issues remain, retrying...")
        time.sleep(1)
        return self.run_lint_fix()
        
    def run_tests_readonly(self) -> bool:
        return self._run_tests(retry=False)

    def run_tests_with_retry(self) -> bool:
        return self._run_tests(retry=True)

    def _run_tests(self, retry: bool) -> bool:
        self.context.current_state = WorkflowState.TEST
        self.context.attempts['test'] += 1
        print(f"\n- 🧪 Running Tests (Attempt {self.context.attempts['test']})...")
        code, stdout, stderr = self.run_command(["pnpm", "run", "test"])
        if code == 0:
            print("✅ All tests passed.")
            return True
        
        print(f"❌ Tests failed:\n{(stdout + stderr)[:2000]}")
        if retry and self.context.attempts['test'] < self.context.max_attempts:
            print(f"\n🔄 Retrying tests...")
            time.sleep(1)
            return self._run_tests(retry=True)
        
        self.context.errors.append("Tests failed.")
        return not retry

    def check_final_status(self) -> bool:
        self.context.current_state = WorkflowState.FINAL_STATUS
        print("\n🔍 Checking Final Git Status...")
        code, status, _ = self.run_command(["git", "status", "--short"])
        if not status:
            print("✅ No changes to commit after fixes.")
            self.context.current_state = WorkflowState.COMPLETED
            return "SKIP_WORKFLOW"
        print(f"📊 Final Git Status:\n{status}")
        return True

    def suggest_commit_message(self) -> bool:
        self.context.current_state = WorkflowState.COMMIT_MESSAGE
        print("\n💬 Generating Commit Message...")
        _, diff_summary, _ = self.run_command(["git", "diff", "--shortstat"])
        prefix = "feat" if self.context.request_type == 'feat' else 'fix'
        subject = f"{prefix}: apply automated fixes and pass checks"
        body = f"{diff_summary.strip()}\n\nAutomated workflow run for '{self.context.request_type}' request."
        print("\n" + "="*60 + "\n📋 Suggested Commit Message:\n" + f"{subject}\n\n{body}" + "\n" + "="*60)
        return True

    def execute(self) -> bool:
        if not self.workflow_steps:
            print("No workflow steps loaded. Exiting.", file=sys.stderr)
            return False
            
        print("=" * 60)
        start_time = time.time()
        
        for step_func, step_name in self.workflow_steps:
            print(f"\n▶️  Executing Step: {step_name}")
            result = step_func()
            if result is False:
                self.context.current_state = WorkflowState.FAILED
                break
            if result == "SKIP_WORKFLOW":
                break

        duration = time.time() - start_time
        print("\n" + "=" * 60)
        
        final_status = WorkflowState.COMPLETED if not self.context.errors else WorkflowState.FAILED
        if final_status == WorkflowState.COMPLETED:
            print(f"✅ Workflow Completed Successfully in {duration:.2f}s")
        else:
            print(f"❌ Workflow Failed in {duration:.2f}s")
            print(f"Errors: {', '.join(set(self.context.errors))}")
        
        return final_status == WorkflowState.COMPLETED

def main():
    if len(sys.argv) < 2:
        print("Usage: ./git_workflow_orchestrator.py <request_type>", file=sys.stderr)
        print("Available types defined in CLAUDE.md: feat, bug, fix, review", file=sys.stderr)
        sys.exit(1)
    
    orchestrator = AgentWorkflowOrchestrator(request_type=sys.argv[1].lower())
    
    if not orchestrator.execute():
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
