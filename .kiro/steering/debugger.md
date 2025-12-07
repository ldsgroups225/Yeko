---
inclusion: manual
description: Systematic debugging approach for identifying and resolving complex issues with root cause analysis and prevention strategies
---

# Debugger Agent Steering

Use this guide when you need expert debugging assistance: `#debugger`

## When to Use the Debugger Agent

- Complex issue diagnosis and root cause analysis
- Production bug investigation
- Performance problem troubleshooting
- Race conditions and concurrency issues
- Memory leaks and resource problems
- Systematic problem-solving needed

## Debugging Workflow

### 1. Issue Analysis
- Collect error logs and stack traces
- Document reproduction steps
- Identify system environment details
- Analyze recent changes
- Assess impact scope

### 2. Systematic Investigation
- Reproduce issue consistently
- Form testable hypotheses
- Design diagnostic experiments
- Collect evidence systematically
- Isolate root cause

### 3. Resolution & Prevention
- Implement fix
- Validate solution thoroughly
- Check for side effects
- Document findings
- Implement prevention measures

## Common Debugging Patterns for Yeko

### React Query Issues
```typescript
// Problem: Stale data not updating
// Debug: Check staleTime, gcTime, and invalidation logic
// Solution: Verify queryClient.invalidateQueries() is called correctly

const { data, isLoading } = useQuery(schoolsQueryOptions())
// Add logging to track query lifecycle
```

### Database Query Problems
```typescript
// Problem: Slow queries or N+1 issues
// Debug: Check query structure and indexes
// Solution: Use Drizzle relations and composite indexes

const schools = await db.query.schools.findMany({
  with: { users: true }, // Verify relations are used
})
```

### Server Function Errors
```typescript
// Problem: Server function returning unexpected errors
// Debug: Check validation, auth, and error handling
// Solution: Add proper error boundaries and logging

export const createSchool = createServerFn({ method: 'POST' })
  .validator(schoolSchema)
  .handler(async ({ data }) => {
    try {
      // Add detailed logging here
      return await insertSchool(data)
    } catch (error) {
      // Log error details for debugging
      throw error
    }
  })
```

### i18n Translation Issues
```typescript
// Problem: Missing or incorrect translations
// Debug: Check translation keys and locale files
// Solution: Verify key exists in both fr.ts and en.ts

const { t } = useTranslation()
// Check browser console for missing translation warnings
```

## Debugging Tools Available

- **Logger**: Use `@repo/logger` for structured logging
- **Drizzle Studio**: Inspect database state
- **React Query DevTools**: Monitor query state
- **Browser DevTools**: Inspect component state
- **Network Tab**: Check API calls
- **Performance Tab**: Profile performance issues

## Key Debugging Principles

1. **Reproduce Consistently**: Ensure issue is reproducible
2. **Isolate Variables**: Change one thing at a time
3. **Check Assumptions**: Verify what you think is true
4. **Document Findings**: Record what you discover
5. **Validate Fixes**: Thoroughly test solutions
6. **Prevent Recurrence**: Add monitoring/tests

## Common Yeko Issues

| Issue | Symptoms | Debug Steps |
|-------|----------|------------|
| Stale data | Old data displayed | Check React Query cache settings |
| Auth failures | 401 errors | Verify session and auth headers |
| Query errors | Database errors | Check Drizzle schema and relations |
| i18n missing | Untranslated text | Verify translation keys exist |
| Performance | Slow page loads | Profile with DevTools |

## Postmortem Template

After resolving critical issues:

1. **Timeline**: When did issue start?
2. **Root Cause**: What was the underlying problem?
3. **Impact**: How many users affected?
4. **Fix**: What was the solution?
5. **Prevention**: How to prevent recurrence?
6. **Monitoring**: What alerts to add?

## Integration with Other Agents

- **QA Expert**: Helps reproduce issues
- **Code Reviewer**: Validates fixes
- **Refactoring Specialist**: Improves problematic code
- **Error Detective**: Analyzes error patterns
