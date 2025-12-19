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

## Property-Based Testing

For critical business logic, use property-based testing with fast-check:

```typescript
import fc from 'fast-check'

// Property: Grade calculations are consistent
test('grade calculation properties', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        score: fc.float({ min: 0, max: 20 }), // French grading scale
        coefficient: fc.float({ min: 0.5, max: 3 })
      }), { minLength: 1 }),
      (assignments) => {
        const average = calculateWeightedAverage(assignments)
        return average >= 0 && average <= 20
      }
    ),
    { numRuns: 100 }
  )
})

// Property: Multi-tenant data isolation
test('school data isolation', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.uuid(),
      fc.uuid(),
      fc.record({ name: fc.string({ minLength: 1 }) }),
      async (schoolId1, schoolId2, studentData) => {
        fc.pre(schoolId1 !== schoolId2) // Precondition
        
        const student = await createStudent(schoolId1, studentData)
        const result = await getStudent(schoolId2, student.id)
        
        return result === null || result.error === 'UNAUTHORIZED'
      }
    )
  )
})
```

## Kiro Integration

### Using Vitest MCP
```bash
# Run tests through Kiro
/mcp vitest run_tests --project-root . --pattern "**/*.test.ts"

# Get coverage
/mcp vitest get_coverage --format detailed
```

### Test Discovery
Use Kiro hooks to automatically discover and run tests:
- `run-tests-on-save.kiro.hook`: Auto-run related tests
- `coverage-check.kiro.hook`: Analyze coverage gaps
- `test-before-commit.kiro.hook`: Pre-commit validation

## Coverage Goals

- Schemas: 100% coverage (use property-based tests)
- Query functions: 80%+ coverage
- Components: 70%+ coverage
- Critical business logic: Property-based testing
- Multi-tenant isolation: Comprehensive edge case testing
