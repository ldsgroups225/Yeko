---
inclusion: always
description: Code review standards, quality guidelines, and best practices for Yeko development
---

# Code Quality Standards for Yeko

## Code Review Checklist

### Before Submitting
- [ ] Code compiles without errors (`pnpm run typecheck`)
- [ ] Linting passes (`pnpm run lint`)
- [ ] Tests pass (`pnpm run test`)
- [ ] No console.log statements (use logger)
- [ ] All strings use i18n translations
- [ ] Accessibility attributes included

### Security
- [ ] No hardcoded secrets or credentials
- [ ] Input validation with Zod schemas
- [ ] SQL injection prevention (use Drizzle ORM)
- [ ] XSS prevention (React handles by default)
- [ ] Auth checks on protected routes/functions

### Performance
- [ ] React Query caching configured
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] Database queries use indexes
- [ ] Pagination for large lists

## ESLint Configuration

The project uses `@yeko/eslint-config` with:
- TypeScript strict rules
- React hooks rules
- Import sorting
- Prettier formatting

```bash
# Fix linting issues
pnpm run lint:fix
```

## File Naming Conventions

```
# Components: kebab-case
school-card.tsx
delete-confirmation-dialog.tsx

# Hooks: use-prefix
use-debounce.ts
use-infinite-scroll.ts

# Schemas: entity name
school.ts (contains schoolSchema)

# Server functions: entity name
schools.ts (contains getSchools, createSchool, etc.)

# Tests: .test suffix
school.test.ts
school-card.test.tsx
```

## Import Aliases

```typescript
// Use @ alias for src imports
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'
import { schoolSchema } from '@/schemas/school'

// Use package imports for data-ops
import { db } from '@repo/data-ops/database/client'
import { schools } from '@repo/data-ops'
```

## Error Handling

### Server Functions
```typescript
try {
  const result = await operation()
  return { success: true, data: result }
} catch (error) {
  console.error('Operation failed:', error)
  return { success: false, error: 'User-friendly message' }
}
```

### React Components
```typescript
const { data, error, isLoading } = useQuery(queryOptions)

if (isLoading) return <Skeleton />
if (error) return <ErrorMessage error={error} />
return <Content data={data} />
```

## Logging

Use the logger package instead of console:
```typescript
import { logger } from '@repo/logger'

logger.info('School created', { schoolId: school.id })
logger.error('Failed to create school', { error })
```

## Git Commit Messages

```
feat: add school import from Excel
fix: resolve dark mode flash on reload
refactor: extract school card component
docs: update API documentation
test: add coefficient validation tests
chore: update dependencies
```

## Refactoring Guidelines

### When to Refactor
- Duplicated code (DRY principle)
- Functions > 50 lines
- Components > 200 lines
- Cyclomatic complexity > 10
- Deep nesting (> 3 levels)

### Safe Refactoring Steps
1. Ensure tests exist for the code
2. Make small, incremental changes
3. Run tests after each change
4. Commit frequently
5. Update documentation

## Performance Optimization

### React Query
```typescript
queryOptions({
  queryKey: ['schools', params],
  queryFn: () => getSchools(params),
  staleTime: 5 * 60 * 1000,  // 5 min - data considered fresh
  gcTime: 30 * 60 * 1000,    // 30 min - cache retention
})
```

### Database
- Use composite indexes for frequent queries
- Paginate large result sets
- Use transactions for bulk operations
- Select only needed columns when possible
