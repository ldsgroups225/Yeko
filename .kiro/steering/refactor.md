---
inclusion: manual
description: Safe code transformation and refactoring techniques with test-driven approach and design pattern application
---

# Refactoring Specialist Agent Steering

Use this guide when you need expert refactoring assistance: `#refactor`

## When to Use the Refactoring Specialist Agent

- Code complexity reduction
- Design pattern application
- Technical debt elimination
- Code smell removal
- Performance optimization through refactoring
- Safe code transformation needed

## Refactoring Workflow

### 1. Code Analysis
- Identify code smells
- Measure complexity metrics
- Check test coverage
- Analyze dependencies
- Assess risk level

### 2. Safe Transformation
- Ensure test coverage exists
- Make small incremental changes
- Verify behavior after each step
- Run tests continuously
- Commit frequently

### 3. Validation & Documentation
- Verify no behavior changes
- Measure improvement
- Update documentation
- Share learnings
- Track metrics

## Code Smells in Yeko

### Long Functions
```typescript
// Before: 150+ line function
export async function processSchoolData(data) {
  // Too much logic here
}

// After: Extracted into smaller functions
export async function processSchoolData(data) {
  const validated = validateSchoolData(data)
  const transformed = transformToSchema(validated)
  return await saveToDatabase(transformed)
}
```

### Duplicate Code
```typescript
// Before: Same logic in multiple places
const activeSchools = schools.filter(s => s.status === 'active')
const activePrograms = programs.filter(p => p.status === 'active')

// After: Extract to utility
const getActive = <T extends { status: string }>(items: T[]) =>
  items.filter(item => item.status === 'active')

const activeSchools = getActive(schools)
const activePrograms = getActive(programs)
```

### Feature Envy
```typescript
// Before: Component accessing too much external state
function SchoolCard({ school }) {
  const { data: users } = useQuery(usersQueryOptions())
  const { data: programs } = useQuery(programsQueryOptions())
  // Using external data too much
}

// After: Pass needed data as props
function SchoolCard({ school, users, programs }) {
  // Focused on school data
}
```

## Refactoring Patterns for Yeko

### Extract Method
```typescript
// Before
export const getSchools = createServerFn({ method: 'GET' })
  .validator(z.object({ status: z.string().optional() }))
  .handler(async ({ data }) => {
    const conditions = []
    if (data.status) conditions.push(eq(schools.status, data.status))
    const [data, count] = await Promise.all([
      db.select().from(schools).where(and(...conditions)),
      db.select({ count: sql<number>`count(*)` }).from(schools),
    ])
    return { data, total: count[0]?.count ?? 0 }
  })

// After: Extract query logic
async function buildSchoolQuery(status?: string) {
  const conditions = status ? [eq(schools.status, status)] : []
  return db.select().from(schools).where(and(...conditions))
}

async function countSchools(status?: string) {
  const conditions = status ? [eq(schools.status, status)] : []
  return db.select({ count: sql<number>`count(*)` }).from(schools).where(and(...conditions))
}

export const getSchools = createServerFn({ method: 'GET' })
  .validator(z.object({ status: z.string().optional() }))
  .handler(async ({ data }) => {
    const [schools, countResult] = await Promise.all([
      buildSchoolQuery(data.status),
      countSchools(data.status),
    ])
    return { data: schools, total: countResult[0]?.count ?? 0 }
  })
```

### Replace Conditional with Polymorphism
```typescript
// Before: Long if-else chains
function getStatusColor(status: string) {
  if (status === 'active') return 'green'
  if (status === 'inactive') return 'gray'
  if (status === 'suspended') return 'red'
  return 'default'
}

// After: Use mapping
const statusColorMap: Record<SchoolStatus, string> = {
  active: 'green',
  inactive: 'gray',
  suspended: 'red',
}

function getStatusColor(status: SchoolStatus) {
  return statusColorMap[status]
}
```

## Refactoring Checklist

- [ ] Tests exist for code being refactored
- [ ] All tests pass before starting
- [ ] Changes are small and incremental
- [ ] Tests pass after each change
- [ ] No behavior changes introduced
- [ ] Code complexity reduced
- [ ] Performance maintained or improved
- [ ] Documentation updated
- [ ] Code review completed

## Complexity Metrics

| Metric | Target | Action |
|--------|--------|--------|
| Cyclomatic Complexity | < 10 | Extract methods if > 10 |
| Function Length | < 50 lines | Extract if longer |
| Class Size | < 200 lines | Split if larger |
| Parameter Count | < 4 | Use object if more |
| Nesting Depth | < 3 | Extract if deeper |

## Performance Refactoring

### React Query Optimization
```typescript
// Before: Fetching too much data
const { data: schools } = useQuery(
  queryOptions({
    queryKey: ['schools'],
    queryFn: () => getSchools(), // Gets all fields
  })
)

// After: Paginate and select fields
const { data: schools } = useQuery(
  queryOptions({
    queryKey: ['schools', page],
    queryFn: () => getSchools({ page, pageSize: 10 }),
    staleTime: 5 * 60 * 1000,
  })
)
```

### Database Query Optimization
```typescript
// Before: N+1 query problem
const schools = await db.select().from(schools)
for (const school of schools) {
  school.users = await db.select().from(users).where(eq(users.schoolId, school.id))
}

// After: Use relations
const schools = await db.query.schools.findMany({
  with: { users: true },
})
```

## Safe Refactoring Steps

1. **Ensure Tests Exist**: Write tests if missing
2. **Run Tests**: Verify all pass
3. **Make Small Change**: One refactoring at a time
4. **Run Tests**: Verify still pass
5. **Commit**: Save progress
6. **Repeat**: Continue with next change
7. **Update Docs**: Document improvements
8. **Code Review**: Get feedback

## Integration with Other Agents

- **Code Reviewer**: Validates refactoring quality
- **QA Expert**: Tests refactored code
- **Debugger**: Helps if issues arise
- **Performance Engineer**: Measures improvements
