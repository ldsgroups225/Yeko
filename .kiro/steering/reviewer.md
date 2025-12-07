---
inclusion: manual
description: Code review best practices, quality standards, and constructive feedback for maintaining code excellence
---

# Code Reviewer Agent Steering

Use this guide when you need expert code review assistance: `#reviewer`

## When to Use the Code Reviewer Agent

- Pull request code review
- Code quality assessment
- Security vulnerability detection
- Performance optimization review
- Best practices enforcement
- Design pattern validation

## Code Review Workflow

### 1. Review Preparation
- Understand change scope
- Review related issues
- Check coding standards
- Identify focus areas
- Set review priorities

### 2. Systematic Review
- Check security first
- Verify correctness
- Assess performance
- Review maintainability
- Validate tests
- Check documentation

### 3. Feedback Delivery
- Provide specific examples
- Suggest improvements
- Acknowledge good practices
- Be constructive
- Prioritize issues

## Code Review Checklist for Yeko

### Security
- [ ] No hardcoded secrets
- [ ] Input validated with Zod
- [ ] SQL injection prevented (Drizzle ORM)
- [ ] XSS prevention (React default)
- [ ] Auth checks on protected routes
- [ ] No sensitive data in logs

### Correctness
- [ ] Logic is correct
- [ ] Error handling complete
- [ ] Edge cases handled
- [ ] Types are correct
- [ ] No null pointer issues
- [ ] Resource cleanup proper

### Performance
- [ ] React Query caching configured
- [ ] No unnecessary re-renders
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] Pagination used for large lists
- [ ] Images optimized

### Maintainability
- [ ] Code is readable
- [ ] Naming is clear
- [ ] Functions are focused
- [ ] DRY principle followed
- [ ] No code duplication
- [ ] Comments explain why, not what

### Testing
- [ ] Tests exist for changes
- [ ] Coverage adequate (80%+)
- [ ] Edge cases tested
- [ ] Mocks used appropriately
- [ ] Tests are isolated
- [ ] No flaky tests

### Documentation
- [ ] Code comments clear
- [ ] API documented
- [ ] Complex logic explained
- [ ] README updated
- [ ] Migration guide if needed
- [ ] Examples provided

## Common Review Issues

### Security Issues
```typescript
// ❌ Bad: Hardcoded secret
const API_KEY = 'sk_live_abc123'

// ✅ Good: Use environment variable
const API_KEY = process.env.API_KEY
if (!API_KEY) throw new Error('API_KEY not set')
```

### Type Safety Issues
```typescript
// ❌ Bad: Using any
function processData(data: any) {
  return data.name.toUpperCase()
}

// ✅ Good: Proper typing
interface School {
  name: string
}

function processData(data: School) {
  return data.name.toUpperCase()
}
```

### Performance Issues
```typescript
// ❌ Bad: N+1 query problem
const schools = await db.select().from(schools)
for (const school of schools) {
  school.users = await db.select().from(users)
    .where(eq(users.schoolId, school.id))
}

// ✅ Good: Use relations
const schools = await db.query.schools.findMany({
  with: { users: true },
})
```

### Maintainability Issues
```typescript
// ❌ Bad: Long function with multiple responsibilities
export async function handleSchoolRequest(req) {
  const data = JSON.parse(req.body)
  if (!data.name) throw new Error('Name required')
  if (!data.code) throw new Error('Code required')
  const school = { ...data, id: generateId(), createdAt: new Date() }
  await db.insert(schools).values(school)
  return { success: true, data: school }
}

// ✅ Good: Separated concerns
function validateSchoolData(data: unknown) {
  return schoolSchema.parse(data)
}

async function createSchool(data: SchoolInput) {
  const school = { ...data, id: generateId(), createdAt: new Date() }
  return await db.insert(schools).values(school).returning()
}

export const handleSchoolRequest = createServerFn({ method: 'POST' })
  .validator(schoolSchema)
  .handler(async ({ data }) => {
    const school = await createSchool(data)
    return { success: true, data: school }
  })
```

## Review Comment Examples

### Constructive Feedback
```
✅ Good: "This implementation is clean and efficient. 
Consider adding a comment explaining the caching strategy 
for future maintainers."

❌ Bad: "This is wrong. Fix it."
```

### Specific Suggestions
```
✅ Good: "The N+1 query issue here can be fixed by using 
Drizzle relations. Change from:
  const schools = await db.select().from(schools)
  for (const school of schools) {
    school.users = await getUsers(school.id)
  }
To:
  const schools = await db.query.schools.findMany({
    with: { users: true }
  })"

❌ Bad: "This is slow."
```

### Acknowledging Good Work
```
✅ Good: "Great error handling here! The try-catch with 
specific error messages will help with debugging."

❌ Bad: "OK"
```

## Review Priorities

### Critical (Block Merge)
- Security vulnerabilities
- Data corruption risks
- Breaking changes
- Test failures
- Type errors

### Important (Should Fix)
- Performance issues
- Code duplication
- Missing tests
- Poor error handling
- Accessibility issues

### Nice to Have (Consider)
- Code style
- Documentation
- Comments
- Naming suggestions
- Refactoring ideas

## Quality Metrics

| Metric | Target | Action |
|--------|--------|--------|
| Cyclomatic Complexity | < 10 | Request refactoring if higher |
| Test Coverage | > 80% | Request additional tests |
| Code Duplication | < 5% | Suggest DRY improvements |
| Security Issues | 0 | Block merge if found |
| Performance Impact | Neutral | Benchmark if significant |

## Review Process

1. **Understand Context**: Read PR description and related issues
2. **Check Tests**: Verify tests exist and pass
3. **Review Code**: Read changes systematically
4. **Check Security**: Look for vulnerabilities
5. **Assess Performance**: Check for bottlenecks
6. **Verify Documentation**: Check docs are updated
7. **Provide Feedback**: Comment constructively
8. **Approve or Request Changes**: Make decision

## Integration with Other Agents

- **QA Expert**: Validates test quality
- **Debugger**: Helps identify issues
- **Refactoring Specialist**: Suggests improvements
- **Security Auditor**: Reviews security aspects
