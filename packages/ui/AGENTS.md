# @workspace/ui — Agent Guide

> **Shared UI component library** based on shadcn/ui (New York style). Provides React components, hooks, and utilities consumed by all frontend apps.
> Source-only package — no build step. Apps import directly from source.

See @../../AGENTS.md for project-wide UI/UX standards.

---

## Quick Reference

| Action     | Command          |
| ---------- | ---------------- |
| Typecheck  | `pnpm typecheck` |
| Lint + fix | `pnpm lint:fix`  |

---

## Tech Stack

- **Component system:** shadcn/ui (New York style)
- **Base primitives:** Base UI (`@base-ui/react`)
- **Styling:** Tailwind CSS v4, `class-variance-authority`, `clsx`, `tailwind-merge`
- **Forms:** `@tanstack/react-form`, `react-hook-form`
- **Charts:** Recharts
- **Date picker:** `react-day-picker`
- **Carousel:** `embla-carousel-react`
- **Drawer:** Vaul
- **Toasts:** Sonner
- **Animations:** `tw-animate-css`
- **Icons:** `@tabler/icons-react`
- **Fonts:** Inter, Plus Jakarta Sans (`@fontsource-variable`)

---

## Directory Structure

```text
src/
├── components/            # shadcn/ui components (~58 files)
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── data-table.tsx
│   ├── date-picker.tsx
│   └── ...
├── hooks/                 # Shared hooks
│   └── *.ts
├── lib/
│   └── utils.ts           # cn() utility (clsx + tailwind-merge)
└── styles/
    └── globals.css         # Global CSS (Tailwind base, components, utilities)
```

---

## Export Map

Source-only exports (no build step):

```typescript
// Components
import { Button } from '@workspace/ui/components/button'
import { Dialog } from '@workspace/ui/components/dialog'
import { Select } from '@workspace/ui/components/select'

// Hooks
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query'

// Utilities
import { cn } from '@workspace/ui/lib/utils'

// Styles
import '@workspace/ui/globals.css'
```

---

## Adding New Components

Use the shadcn CLI from the consuming app (not from this package):

```bash
# From an app directory (e.g., apps/core/)
npx shadcn@latest add [component-name]
```

Then move the generated component to `packages/ui/src/components/` for sharing.

The `components.json` in this package configures shadcn generation:

- Style: `new-york`
- TSX: enabled
- Aliases: `@workspace/ui/*`

---

## Conventions

### `cn()` Utility

Always use `cn()` for conditional class merging:

```typescript
import { cn } from '@workspace/ui/lib/utils'

<div className={cn('base-class', isActive && 'active-class')} />
```

### SelectValue Labels

`SelectTrigger` MUST display human-readable labels:

```tsx
// ✅ Correct
<SelectValue>{items.find(i => i.id === value)?.name}</SelectValue>

// ❌ Wrong — shows raw ID or nothing
<SelectValue />
```

---

## Do NOT

- ❌ Add a build step — this is a source-only package
- ❌ Import app-specific code or data-ops queries
- ❌ Use app-specific i18n — keep components language-neutral
- ❌ Add heavy dependencies without considering bundle impact on all apps
