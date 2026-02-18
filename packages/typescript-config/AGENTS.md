# @workspace/typescript-config — Agent Guide

> **Shared TypeScript configuration** bases for the Yeko monorepo. Provides preset `tsconfig.json` files that other packages extend.

---

## Available Configs

| Config File | Purpose | Extended By |
| --- | --- | --- |
| `base.json` | Base strict settings (target, module, paths) | All packages |
| `nextjs.json` | Next.js-specific settings | N/A (legacy) |
| `react-library.json` | React library compilation | `@workspace/ui` |
| `vite-react-library.json` | Vite + React library | Apps using Vite |

## Usage

```jsonc
// tsconfig.json in consuming package
{
  "extends": "@workspace/typescript-config/base.json",
  "compilerOptions": { /* overrides */ },
  "include": ["src"]
}
```

---

## Do NOT

- ❌ Weaken `strict` mode — all packages must use strict TypeScript
- ❌ Add `skipLibCheck: true` unless solving a specific third-party type conflict
- ❌ Modify configs without testing across all dependent packages
