---
inclusion: manual
---

# Yeko Subagents Guide

This guide explains when and how to use Yeko's specialized subagents for efficient development workflows.

## Available Subagents

### 🔍 yeko-code-reviewer
**When to use**: Code quality assessment, security review, architecture compliance
**Expertise**: Yeko patterns, EdTech security, French-first i18n, multi-tenant isolation
**Triggers**: Before merging, during code reviews, security audits

```markdown
Use the yeko-code-reviewer subagent to review the grade management feature for:
- Security vulnerabilities in student data handling
- Multi-tenant data isolation compliance
- French-first i18n implementation
- React Query caching configuration
- Accessibility compliance (WCAG AA)
```

### 🎨 yeko-frontend-developer
**When to use**: React component development, UI implementation, mobile-first design
**Expertise**: TanStack Start, shadcn/ui, responsive design, EdTech UX patterns
**Triggers**: Building new components, UI features, mobile optimization

```markdown
Use the yeko-frontend-developer subagent to create:
- Student grade display components with French localization
- Mobile-responsive attendance tracking interface
- Accessible form components for teacher workflows
- Progressive loading for slow networks
```

### 🔧 yeko-fullstack-developer
**When to use**: Complete feature development from database to UI
**Expertise**: End-to-end implementation, multi-tenant architecture, EdTech workflows
**Triggers**: New feature development, complex integrations, API design

```markdown
Use the yeko-fullstack-developer subagent to implement:
- Complete student enrollment workflow
- Grade calculation and reporting system
- Parent-teacher communication features
- Academic calendar management
```

### 🧪 yeko-test-automator
**When to use**: Test strategy, automation framework, quality assurance
**Expertise**: Vitest, Playwright, multi-tenant testing, French UI testing
**Triggers**: Test implementation, CI/CD setup, quality gates

```markdown
Use the yeko-test-automator subagent to:
- Create comprehensive test suite for grade management
- Implement E2E tests for teacher workflows
- Set up multi-tenant security testing
- Add French-language UI validation tests
```

### 🗄️ yeko-database-specialist
**When to use**: Schema design, query optimization, multi-tenant data modeling
**Expertise**: PostgreSQL, Drizzle ORM, EdTech data models, performance tuning
**Triggers**: Database design, performance issues, data migration

```markdown
Use the yeko-database-specialist subagent to:
- Design multi-tenant grade storage schema
- Optimize student query performance
- Implement data retention policies
- Create efficient indexing strategies
```

### 🔒 yeko-security-auditor
**When to use**: Security assessment, compliance review, vulnerability testing
**Expertise**: Multi-tenant security, GDPR compliance, EdTech data protection
**Triggers**: Security reviews, compliance audits, vulnerability assessments

```markdown
Use the yeko-security-auditor subagent to:
- Audit multi-tenant data isolation
- Review student data privacy compliance
- Assess authentication security
- Validate input sanitization
```

### ⚡ yeko-performance-engineer
**When to use**: Performance optimization, bundle analysis, network efficiency
**Expertise**: React optimization, Cloudflare Workers, African network conditions
**Triggers**: Performance issues, bundle size concerns, slow loading

```markdown
Use the yeko-performance-engineer subagent to:
- Optimize grade loading for 3G networks
- Reduce bundle size for mobile devices
- Implement progressive loading strategies
- Analyze database query performance
```

## Subagent Coordination Patterns

### Sequential Workflow
For complex features, use subagents in sequence:

1. **yeko-database-specialist** → Design schema
2. **yeko-fullstack-developer** → Implement feature
3. **yeko-test-automator** → Add test coverage
4. **yeko-security-auditor** → Security review
5. **yeko-code-reviewer** → Final quality check

### Parallel Workflow
For independent tasks, use subagents in parallel:

```markdown
Use subagents in parallel to:
- yeko-frontend-developer: Build grade entry form
- yeko-database-specialist: Optimize grade queries
- yeko-test-automator: Create test scenarios
- yeko-performance-engineer: Analyze bundle impact
```

### Specialized Reviews
Use multiple subagents for comprehensive reviews:

```markdown
Review the student management system using:
- yeko-security-auditor: Data privacy and access control
- yeko-performance-engineer: Loading performance and caching
- yeko-code-reviewer: Code quality and architecture
- yeko-test-automator: Test coverage and quality
```

## Best Practices

### When to Use Subagents
- **Complex Features**: Use yeko-fullstack-developer for end-to-end implementation
- **Specialized Expertise**: Use domain-specific subagents for their expertise areas
- **Quality Gates**: Use review subagents before merging or deploying
- **Performance Issues**: Use yeko-performance-engineer for optimization
- **Security Concerns**: Use yeko-security-auditor for security assessment

### Subagent Communication
- **Clear Context**: Provide specific requirements and constraints
- **Yeko Patterns**: Reference existing Yeko architecture and patterns
- **EdTech Focus**: Emphasize educational domain requirements
- **French-First**: Always mention French localization requirements
- **Multi-Tenant**: Specify school isolation requirements

### Integration Points
- **Database Changes**: Coordinate yeko-database-specialist with yeko-fullstack-developer
- **UI Components**: Align yeko-frontend-developer with yeko-test-automator
- **Security Features**: Sync yeko-security-auditor with yeko-code-reviewer
- **Performance**: Coordinate yeko-performance-engineer with all development subagents

## Example Workflows

### New Feature Development
```markdown
Implement student attendance tracking:

1. Use yeko-database-specialist to design attendance schema
2. Use yeko-fullstack-developer to implement API and UI
3. Use yeko-test-automator to add comprehensive tests
4. Use yeko-security-auditor to review data access patterns
5. Use yeko-performance-engineer to optimize for mobile
6. Use yeko-code-reviewer for final quality assessment
```

### Performance Optimization
```markdown
Optimize grade loading performance:

1. Use yeko-performance-engineer to analyze current performance
2. Use yeko-database-specialist to optimize queries
3. Use yeko-frontend-developer to implement progressive loading
4. Use yeko-test-automator to add performance tests
```

### Security Review
```markdown
Audit student data security:

1. Use yeko-security-auditor to assess current security posture
2. Use yeko-database-specialist to review data isolation
3. Use yeko-code-reviewer to check input validation
4. Use yeko-test-automator to add security tests
```

### Code Quality Improvement
```markdown
Improve codebase quality:

1. Use yeko-code-reviewer to identify quality issues
2. Use yeko-frontend-developer to refactor React components
3. Use yeko-database-specialist to optimize queries
4. Use yeko-test-automator to improve test coverage
5. Use yeko-performance-engineer to address performance issues
```

## Subagent Handoff Patterns

### Database → Fullstack
```markdown
yeko-database-specialist creates schema, then yeko-fullstack-developer implements:
- Share schema definitions and relationships
- Provide query optimization recommendations
- Include indexing strategies
- Document multi-tenant patterns
```

### Fullstack → Test
```markdown
yeko-fullstack-developer implements feature, then yeko-test-automator adds tests:
- Share API contracts and expected behaviors
- Provide test data factories
- Include edge cases and error scenarios
- Document multi-tenant test requirements
```

### Development → Review
```markdown
Development subagents complete work, then review subagents assess:
- Provide implementation context and decisions
- Share performance considerations
- Include security implications
- Document architectural choices
```

## Success Metrics

- **Feature Velocity**: Faster development with specialized expertise
- **Code Quality**: Higher quality through expert review
- **Security Posture**: Better security through specialized auditing
- **Performance**: Optimized applications through focused optimization
- **Test Coverage**: Comprehensive testing through automation expertise
- **Maintainability**: Better architecture through specialized design

Always leverage subagent expertise to deliver high-quality, secure, and performant EdTech solutions for French-speaking African schools.
