---
inclusion: fileMatch
fileMatchPattern: "**/*.test.{ts,tsx}"
description: Vitest testing patterns, component testing, and coverage guidelines
---

# Testing Standards for Yeko

## Test Framework

- **Unit/Integration**: Vitest
- **Component Testing**: @testing-library/react
- **Coverage**: @vitest/coverage-v8

## Test File Organization

```
src/
  schemas/
    school.ts
    school.test.ts      # Co-located tests
  components/
    schools/
      school-card.tsx
      school-card.test.tsx
packages/data-ops/
  src/tests/
    schools.test.ts     # Database query tests
    programs.test.ts
```

## Unit Test Pattern

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { schoolSchema } from './school'

describe('schoolSchema', () => {
  it('should validate valid school data', () => {
    const validData = {
      name: 'École Primaire',
      code: 'EP001',
      status: 'active',
    }
    
    const result = schoolSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const invalidData = {
      name: 'École',
      code: 'EP001',
      email: 'invalid-email',
    }
    
    const result = schoolSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})
```

## Component Test Pattern

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SchoolCard } from './school-card'

describe('SchoolCard', () => {
  const mockSchool = {
    id: '1',
    name: 'École Test',
    code: 'ET001',
    status: 'active' as const,
  }

  it('should render school name', () => {
    render(<SchoolCard school={mockSchool} />)
    expect(screen.getByText('École Test')).toBeInTheDocument()
  })

  it('should call onEdit when edit button clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    
    render(<SchoolCard school={mockSchool} onEdit={onEdit} />)
    
    await user.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith('1')
  })
})
```

## Database Query Tests

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '../database/client'
import { schools } from '../drizzle/core-schema'
import { getSchools, createSchool } from '../queries/schools'

describe('School Queries', () => {
  beforeAll(async () => {
    // Setup test data
    await db.insert(schools).values([
      { id: 'test-1', name: 'Test School 1', code: 'TS1', status: 'active' },
      { id: 'test-2', name: 'Test School 2', code: 'TS2', status: 'inactive' },
    ])
  })

  afterAll(async () => {
    // Cleanup
    await db.delete(schools).where(like(schools.id, 'test-%'))
  })

  it('should filter schools by status', async () => {
    const result = await getSchools({ status: 'active' })
    expect(result.data.every(s => s.status === 'active')).toBe(true)
  })

  it('should paginate results', async () => {
    const result = await getSchools({ page: 1, pageSize: 1 })
    expect(result.data.length).toBeLessThanOrEqual(1)
    expect(result.total).toBeGreaterThan(0)
  })
})
```

## Mocking Patterns

### Mock Server Functions
```typescript
import { vi } from 'vitest'

vi.mock('@/core/functions/schools', () => ({
  getSchools: vi.fn().mockResolvedValue({
    data: [{ id: '1', name: 'Mock School' }],
    total: 1,
  }),
}))
```

### Mock React Query
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}
```

## Test Commands

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run with coverage
pnpm run test -- --coverage

# Run specific test file
pnpm run test -- schools.test.ts
```

## Coverage Goals

- Schemas: 100% coverage
- Query functions: 80%+ coverage
- Components: 70%+ coverage
- Focus on critical business logic
