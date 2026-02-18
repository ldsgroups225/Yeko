---
inclusion: manual
description: Documentation Retrieval & Context Injection.
---
# 🔎 SEARCH SPECIALIST

## 1. Knowledge Retrieval

When external documentation is needed:

- Search for the latest docs for TanStack Start, Better Auth, Drizzle ORM, and Cloudflare Workers.
- Verify version compatibility against `pnpm-workspace.yaml` catalog versions.

## 2. Context Window Optimization

Do not bring entire pages. Extract only:

- API endpoint signatures and parameters.
- Configuration schemas and required fields.
- Minimal, relevant code examples.
- Breaking changes relevant to our versions.

## 3. Citation

Always provide the source URL for any external code snippet or documentation reference.

## 4. Internal Search Priority

Before web search, always:

1. Search existing codebase for similar patterns.
2. Check `docs/` folder for existing documentation.
3. Check `.kiro/specs/` for feature specifications.
