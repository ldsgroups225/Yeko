---
inclusion: always
description: Central reference for Yeko project structure, tech stack, and development patterns
---

# Yeko Project Overview

## About Yeko

Yeko is an EdTech SaaS platform for school management in French-speaking Africa. The architecture follows a Core → School → [Teacher/Parent] pattern where:

- **Yeko Core**: Super Admin platform providing global templates and catalogs
- **Yeko School**: Multi-tenant school administration (instantiates Core templates)
- **Yeko Teacher/Parent**: Consumer apps (future phases)

## Tech Stack

### Frontend (apps/core, apps/school)
- **Framework**: TanStack Start (React 19 + SSR)
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york style)
- **State**: TanStack Query (React Query v5)
- **Routing**: TanStack Router (file-based)
- **Forms**: React Hook Form + Zod validation
- **i18n**: i18next (French default, English support)
- **Animations**: Motion (framer-motion)
- **Icons**: Lucide React

### Backend
- **Runtime**: Cloudflare Workers (Vite plugin)
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Auth**: Better Auth
- **Validation**: Zod v4

### Monorepo Structure
```
apps/
  core/          # Yeko Core (Super Admin)
  school/        # Yeko School (Multi-tenant)
  data-service/  # API service
packages/
  data-ops/      # Database, auth, queries
  logger/        # Logging utilities
  eslint-config/ # Shared ESLint config
```

## Key Patterns

### Server Functions
Use TanStack Start server functions for API calls:
```typescript
import { createServerFn } from '@tanstack/react-start'

export const getSchools = createServerFn({ method: 'GET' })
  .validator(z.object({ status: z.string().optional() }))
  .handler(async ({ data }) => {
    // Server-side logic
  })
```

### React Query Integration
```typescript
// integrations/tanstack-query/schools-options.ts
export const schoolsQueryOptions = (params) =>
  queryOptions({
    queryKey: ['schools', params],
    queryFn: () => getSchools(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
```

### Component Structure
```
components/
  ui/           # shadcn/ui primitives
  layout/       # Layout components
  [feature]/    # Feature-specific components
```

### Database Schema Location
- Auth schema: `packages/data-ops/src/drizzle/auth-schema.ts`
- Core schema: `packages/data-ops/src/drizzle/core-schema.ts`
- Queries: `packages/data-ops/src/queries/`

## Development Commands

```bash
# Setup
pnpm run setup

# Development
pnpm run dev:yeko-core    # Core app on port 3000
pnpm run dev:yeko-school  # School app

# Database
cd packages/data-ops
pnpm run drizzle:generate  # Generate migrations
pnpm run drizzle:migrate   # Apply migrations
pnpm run studio            # Drizzle Studio

# Testing
pnpm run test              # Run all tests
```

## Language & Localization

- Default language: French (fr)
- Supported: French, English
- All UI strings must use i18next
- Translation files: `apps/core/src/i18n/locales/`
