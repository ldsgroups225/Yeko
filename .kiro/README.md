# Yeko Kiro Configuration

This directory contains the complete Kiro configuration for the Yeko EdTech platform, including specialized subagents and comprehensive steering files.

## Directory Structure

```
.kiro/
├── README.md                    # This file
├── .agents.md                   # Main agent configuration
├── hooks/                       # Agent hooks (if any)
├── steering/                    # Steering files for guidance
│   ├── project-overview.md      # Always included - project context
│   ├── code-quality.md          # Always included - quality standards
│   ├── subagents-guide.md       # Manual - subagent usage guide
│   ├── typescript-standards.md  # *.ts, *.tsx - TypeScript patterns
│   ├── react-components.md      # *.tsx - React component patterns
│   ├── database-patterns.md     # data-ops/**/*.ts - DB patterns
│   ├── api-patterns.md          # functions/**/*.ts - API patterns
│   ├── testing-standards.md     # *.test.* - Testing guidelines
│   ├── i18n-guide.md           # i18n/**/* - Internationalization
│   ├── ui-design.md            # components/**/*.tsx - UI patterns
│   ├── routing-navigation.md    # routes/**/*.tsx - Routing
│   └── excel-import-export.md   # Manual - Excel features
└── subagents/                   # Specialized subagents
    ├── yeko-code-reviewer.md    # Code quality & security review
    ├── yeko-frontend-developer.md # React & UI development
    ├── yeko-fullstack-developer.md # End-to-end development
    ├── yeko-test-automator.md   # Test automation & QA
    ├── yeko-database-specialist.md # Database design & optimization
    ├── yeko-security-auditor.md # Security & compliance
    └── yeko-performance-engineer.md # Performance optimization
```

## Specialized Subagents

### 🔍 Code Reviewer
- **Focus**: Code quality, security, architecture compliance
- **Expertise**: Yeko patterns, EdTech security, multi-tenant isolation
- **Use for**: Code reviews, security audits, quality assessments

### 🎨 Frontend Developer
- **Focus**: React components, UI/UX, mobile-first design
- **Expertise**: TanStack Start, shadcn/ui, responsive design
- **Use for**: Component development, UI implementation, mobile optimization

### 🔧 Fullstack Developer
- **Focus**: End-to-end feature development
- **Expertise**: Complete stack implementation, multi-tenant architecture
- **Use for**: New features, complex integrations, API design

### 🧪 Test Automator
- **Focus**: Test strategy, automation, quality assurance
- **Expertise**: Vitest, Playwright, multi-tenant testing
- **Use for**: Test implementation, CI/CD setup, quality gates

### 🗄️ Database Specialist
- **Focus**: Schema design, query optimization, data modeling
- **Expertise**: PostgreSQL, Drizzle ORM, EdTech data models
- **Use for**: Database design, performance tuning, data migration

### 🔒 Security Auditor
- **Focus**: Security assessment, compliance, vulnerability testing
- **Expertise**: Multi-tenant security, GDPR compliance, data protection
- **Use for**: Security reviews, compliance audits, vulnerability assessments

### ⚡ Performance Engineer
- **Focus**: Performance optimization, bundle analysis, network efficiency
- **Expertise**: React optimization, Cloudflare Workers, African networks
- **Use for**: Performance issues, bundle optimization, network efficiency

## Steering Files

### Always Included
- **project-overview.md**: Core project context and architecture
- **code-quality.md**: Quality standards and best practices

### File-Triggered
- **typescript-standards.md**: Triggered by `*.ts`, `*.tsx` files
- **react-components.md**: Triggered by `*.tsx` files
- **database-patterns.md**: Triggered by `data-ops/**/*.ts` files
- **api-patterns.md**: Triggered by `functions/**/*.ts` files
- **testing-standards.md**: Triggered by `*.test.*` files
- **i18n-guide.md**: Triggered by `i18n/**/*` files
- **ui-design.md**: Triggered by `components/**/*.tsx` files
- **routing-navigation.md**: Triggered by `routes/**/*.tsx` files

### Manual Inclusion
- **subagents-guide.md**: Use `#subagents-guide` to include
- **excel-import-export.md**: Use `#excel-import-export` to include

## Usage Examples

### Using Subagents
```markdown
# For comprehensive feature development
Use the yeko-fullstack-developer subagent to implement the complete student enrollment workflow including database schema, API endpoints, and React components.

# For specialized review
Use the yeko-security-auditor subagent to review the grade management system for multi-tenant data isolation and student data privacy compliance.

# For performance optimization
Use the yeko-performance-engineer subagent to optimize the attendance tracking interface for 3G networks in African schools.
```

### Including Steering Files
```markdown
# Include subagent guidance
#subagents-guide

# Include Excel feature patterns
#excel-import-export
```

## Key Features

### EdTech Specialization
- Student information systems
- Grade and attendance tracking
- Parent-teacher communication
- Academic calendar management
- Multi-tenant school isolation

### French-African Context
- French-first internationalization
- Cultural context for African schools
- Network optimization for African conditions
- Mobile-first design for African devices
- Regulatory compliance (GDPR, local laws)

### Technical Excellence
- TypeScript strict mode
- React 19 + TanStack Start
- Drizzle ORM + PostgreSQL
- Cloudflare Workers
- Comprehensive testing
- Security-first approach
- Performance optimization

## Best Practices

### Development Workflow
1. Check relevant steering files for patterns
2. Use appropriate subagents for specialized tasks
3. Follow Yeko architecture patterns
4. Implement French-first i18n
5. Ensure multi-tenant security
6. Add comprehensive tests
7. Optimize for African networks

### Quality Gates
- Code compiles without errors
- Linting passes
- Tests pass with good coverage
- Security review completed
- Performance benchmarks met
- Accessibility compliance verified
- French translations complete

### Subagent Coordination
- Use sequential workflows for dependent tasks
- Use parallel workflows for independent tasks
- Coordinate database changes with fullstack development
- Align UI development with testing
- Sync security reviews with code reviews

## Success Metrics

- **Development Velocity**: Faster feature delivery with specialized expertise
- **Code Quality**: Higher quality through expert review and patterns
- **Security Posture**: Better security through specialized auditing
- **Performance**: Optimized for African network conditions
- **User Experience**: French-first, mobile-optimized EdTech interfaces
- **Maintainability**: Consistent architecture and patterns
- **Test Coverage**: Comprehensive testing across all layers

This configuration provides a complete development environment tailored for building world-class EdTech solutions for French-speaking African schools.
