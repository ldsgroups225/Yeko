# @yeko/eslint-config — Agent Guide

> **Shared ESLint configuration** for the Yeko monorepo. Based on `@antfu/eslint-config` with TypeScript, React, Tailwind CSS, accessibility (a11y), and Vitest support.

---

## Overview

This package provides a single, comprehensive ESLint config consumed by all apps and packages via:

```javascript
// eslint.config.js in consuming package
import config from '@yeko/eslint-config'
export default config
```

---

## Key Rules

| Rule Category | Configuration |
| --- | --- |
| **TypeScript** | Strict — enabled via @antfu/eslint-config |
| **React** | Enabled with hooks best practices |
| **Formatters** | Enabled (replaces Prettier) |
| **Tailwind CSS** | `eslint-plugin-better-tailwindcss` for apps (core, school, teacher) |
| **Accessibility** | `eslint-plugin-jsx-a11y` with shadcn component mappings |
| **Vitest** | Test-specific rules (`no-focused-tests`, `consistent-test-it`) |
| **Console** | `no-console` warn (allows `console.warn` and `console.error`) |
| **File length** | Max 300 lines (500 for tests, 400 for route files) |

### File Length Limits

| File Type | Max Lines (non-blank, non-comment) |
| --- | --- |
| Regular files | **300** (error) |
| Route files (`**/routes/**/*.tsx`) | **400** (warn) |
| Test files (`*.test.ts`, `*.spec.ts`) | **500** (warn) |

### Ignored Paths

`dist/`, `node_modules/`, `coverage/`, `.next/`, `.nuxt/`, `.output/`, `.turbo/`, `.wrangler/`

---

## Modifying This Config

When updating this config:

1. Changes affect **ALL** packages and apps in the monorepo.
2. Test changes by running `pnpm lint` from the root.
3. Major rule changes should be discussed — they impact the entire team.

---

## Do NOT

- ❌ Override rules in individual packages unless absolutely necessary
- ❌ Disable `max-lines` — keep files focused and modular
- ❌ Remove `jsx-a11y` rules — accessibility is required
