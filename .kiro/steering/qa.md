---
inclusion: manual
description: Comprehensive quality assurance strategy, test planning, and quality metrics for systematic testing
---

# QA Expert Agent Steering

Use this guide when you need expert QA assistance: `#qa`

## When to Use the QA Expert Agent

- Test strategy and planning
- Test case design and execution
- Quality metrics and reporting
- Defect management
- Test automation strategy
- Release readiness assessment

## QA Workflow

### 1. Quality Analysis
- Review requirements
- Assess current coverage
- Identify risk areas
- Analyze defect patterns
- Plan test strategy

### 2. Test Execution
- Design test cases
- Execute tests
- Track defects
- Automate regression tests
- Monitor quality metrics

### 3. Quality Reporting
- Report findings
- Track metrics
- Recommend improvements
- Plan next iterations
- Validate fixes

## Test Strategy for Yeko

### Coverage Goals
- **Schemas**: 100% coverage (Zod validation)
- **Query Functions**: 80%+ coverage
- **Components**: 70%+ coverage
- **Server Functions**: 85%+ coverage
- **Overall**: 80%+ coverage

### Test Types

| Type | Coverage | Tools |
|------|----------|-------|
| Unit Tests | Schemas, utilities | Vitest |
| Component Tests | React components | @testing-library/react |
| Integration Tests | Server functions + DB | Vitest |
| E2E Tests | Critical user flows | Playwright (future) |
| Performance Tests | Load testing | Vitest benchmarks |

## Test Case Examples

### Schema Validation Tests
```typescript
describe('schoolSchema', () => {
  it('should validate valid school data', () => {
    const result = schoolSchema.safeParse({
      name: 'École Test',
      code: 'ET001',
      status: 'active',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = schoolSchema.safeParse({
      name: 'École',
      code: 'ET001',
      email: 'invalid',
    })
    expect(result.success).toBe(false)
  })
})
```

### Component Tests
```typescript
describe('SchoolCard', () => {
  it('should render school name', () => {
    render(<SchoolCard school={mockSchool} />)
    expect(screen.getByText('École Test')).toBeInTheDocument()
  })

  it('should call onEdit when edit button clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<SchoolCard school={mockSchool} onEdit={onEdit} />)
    await user.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(mockSchool.id)
  })
})
```

### Query Tests
```typescript
describe('getSchools', () => {
  it('should filter schools by status', async () => {
    const result = await getSchools({ status: 'active' })
    expect(result.data.every(s => s.status === 'active')).toBe(true)
  })

  it('should paginate results', async () => {
    const result = await getSchools({ page: 1, pageSize: 10 })
    expect(result.data.length).toBeLessThanOrEqual(10)
    expect(result.total).toBeGreaterThan(0)
  })
})
```

## Defect Management

### Severity Levels
- **Critical**: System down, data loss, security issue
- **High**: Major feature broken, significant impact
- **Medium**: Feature partially broken, workaround exists
- **Low**: Minor issue, cosmetic, no workaround needed

### Defect Lifecycle
1. **Discovery**: Found during testing
2. **Reporting**: Documented with reproduction steps
3. **Triage**: Assigned priority and severity
4. **Resolution**: Developer fixes issue
5. **Verification**: QA confirms fix
6. **Closure**: Defect resolved

## Quality Metrics

### Key Metrics
- **Test Coverage**: % of code covered by tests
- **Defect Density**: Defects per 1000 lines of code
- **Defect Escape Rate**: Defects found in production
- **Test Effectiveness**: % of defects caught by tests
- **Automation Rate**: % of tests automated

### Tracking
```typescript
// Example metrics dashboard
{
  testCoverage: 82,
  defectDensity: 2.3,
  automationRate: 73,
  criticalDefects: 0,
  highDefects: 2,
  mediumDefects: 8,
  lowDefects: 15,
}
```

## Test Automation Strategy

### Automation Priorities
1. **Regression Tests**: Automated first
2. **Critical Paths**: User journeys
3. **Data Validation**: Schema and query tests
4. **API Tests**: Server function tests
5. **UI Tests**: Component interactions

### Automation Tools
- **Unit/Integration**: Vitest
- **Component**: @testing-library/react
- **E2E**: Playwright (future)
- **Performance**: Vitest benchmarks

## Risk-Based Testing

### High-Risk Areas
- Authentication and authorization
- Data persistence (database)
- Payment processing (future)
- User data privacy
- Critical business logic

### Testing Focus
- Prioritize high-risk areas
- Increase test coverage for critical features
- Add regression tests for bugs
- Automate frequently-used paths

## Release Checklist

- [ ] All tests passing
- [ ] Code coverage > 80%
- [ ] No critical defects
- [ ] Performance acceptable
- [ ] Security review complete
- [ ] Documentation updated
- [ ] Accessibility verified
- [ ] Stakeholder approval

## Common Testing Issues

| Issue | Solution |
|-------|----------|
| Flaky tests | Use proper async handling, avoid timeouts |
| Slow tests | Optimize queries, use mocks |
| Hard to test | Refactor for testability |
| Low coverage | Add tests for critical paths |
| Maintenance burden | Use page objects, reduce duplication |

## Integration with Other Agents

- **Code Reviewer**: Validates test quality
- **Debugger**: Helps reproduce issues
- **Refactoring Specialist**: Improves testability
- **Test Automator**: Implements automation
