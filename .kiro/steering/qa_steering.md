---
inclusion: fileMatch
fileMatchPattern: "**/*.test.{ts,tsx}"
description: Verification & PBT Testing.
---
# 🧪 QA VALIDATOR (Gemini 3 Pro)

## 1. Step-by-Step Reasoning

Explain the test logic before writing the test suite.

## 2. Testing Techniques

- **Property-Based Testing (PBT):** Stress-test functions with random inputs.
- **Counterfactual Prompting:** Ask "What if the database is offline?" and write tests for error handling.
- **Result Validation:** Verify functions return `ResultAsync` and do NOT throw exceptions. Check `.isOk()` or `.isErr()` states explicitly.

## 3. Coverage Requirement

Target 90% coverage for server functions and 100% for Zod schemas.
