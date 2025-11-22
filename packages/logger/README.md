# @repo/logger

A comprehensive logging solution for the Yeko educational management platform, built on top of [LogTape](https://logtape.org/) - a zero-dependency, universal runtime logging library.

## Features

- 🎯 **Yeko-Specific Context**: Built-in support for educational platform logging (schools, users, academic contexts)
- 🔧 **Zero Dependencies**: Leverages LogTape's zero-dependency approach
- 🌐 **Universal Runtime**: Works on Node.js, Cloudflare Workers, browsers, and edge functions
- 📝 **Structured Logging**: JSON and structured log support for better analysis
- 🎨 **Environment-Aware**: Different configurations for development, production, and testing
- 🔒 **Security-Focused**: Automatic data masking and audit logging capabilities
- ⚡ **Performance Monitoring**: Built-in performance tracking and metrics
- 🛡️ **Type Safety**: Full TypeScript support with strict typing

## Installation

```bash
pnpm add @repo/logger
```

## Quick Start

### Basic Usage

```typescript
import { createLogger, initLogging } from '@repo/logger'

// Initialize logging system
await initLogging()

// Create a logger
const logger = createLogger(['my-module'])

// Use the logger
logger.info('Application started')
logger.error('Something went wrong', new Error('Database error'))
logger.audit('User logged in', { userId: '123', role: 'teacher' })
```

### With Environment Detection

```typescript
import { createLogger, initLogging } from '@repo/logger'

// Automatically detects environment and configures accordingly
await initLogging({
  level: 'info',
  enableColors: process.env.NODE_ENV === 'development',
  enableStructuredLogging: process.env.NODE_ENV === 'production',
})
```

## Yeko-Specific Features

### Educational Context Logging

```typescript
import { createServerLogger } from '@repo/logger'

const logger = createServerLogger(['academic'])

// Log with educational context
logger.info('Grade submitted', {
  userId: 'student-123',
  userRole: 'student',
  schoolId: 'school-456',
  academicYearId: 'year-2024',
  courseId: 'math-101',
  subjectId: 'mathematics',
})
```

### Multi-Tenant Logging

```typescript
// Create school-specific logger
const schoolLogger = logger.withSchool('school-123')

// Create user-specific logger
const userLogger = schoolLogger.withUser('user-456', 'teacher')

// All logs will automatically include school and user context
userLogger.info('Created assignment')
```

### Performance Monitoring

```typescript
import { PerformanceTracker } from '@repo/logger'

// Track operation performance
const tracker = PerformanceTracker.start('database-query')
// ... perform operation
tracker.end() // Automatically logs duration
```

### Audit Logging

```typescript
// Log sensitive operations
logger.audit('User role changed', {
  userId: 'admin-123',
  targetUserId: 'user-456',
  oldRole: 'student',
  newRole: 'teacher',
  schoolId: 'school-789',
})

// Security events
logger.security('Suspicious login attempt', {
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  attemptedUser: 'admin@yeko.app',
})
```

## Server-Side Usage

### HTTP Request Logging

```typescript
import { RequestLogger } from '@repo/logger'

// In your API handler
const requestLogger = new RequestLogger(
  requestId,
  req.method,
  req.url,
  req.headers['user-agent'],
  req.ip
)

try {
  // Process request
  requestLogger.success(200)
}
catch (error) {
  requestLogger.error(error as Error, 500)
}
```

### Database Operations

```typescript
import { databaseLogger } from '@repo/logger'

databaseLogger.info('Database connection established', {
  host: 'localhost',
  port: 5432,
  database: 'yeko_prod',
})

databaseLogger.error('Query failed', error, {
  query: 'SELECT * FROM users WHERE id = $1',
  duration: 150,
})
```

## Client-Side Usage

### React Integration

```typescript
import { useLogger, logUserAction } from '@/lib/logger'

function MyComponent() {
  const { logger, userLogger } = useLogger()

  const handleClick = () => {
    // Log user actions
    logUserAction('button_click', 'submit-button', {
      component: 'MyComponent',
      action: 'submit_form',
    })

    // Performance tracking
    const tracker = userLogger.startTimer('form_submission')
    // ... submit form
    tracker.end()
  }

  return <button onClick={handleClick}>Submit</button>
}
```

### Error Handling

```typescript
import { setupGlobalErrorHandling } from '@repo/logger'

// Set up global error handlers
setupGlobalErrorHandling()

// Or manually log errors
try {
  // Risky operation
}
catch (error) {
  logger.error('Operation failed', error as Error, {
    component: 'DataProcessor',
    operation: 'parse-csv',
  })
}
```

## Configuration

### Environment-Specific Configurations

The package comes with pre-configured environments:

- **Development**: Verbose logging with colors and console output
- **Production**: Structured JSON logging, warning level and above
- **Testing**: Silent logging with memory sink for assertions

### Custom Configuration

```typescript
import { initLogging } from '@repo/logger'

await initLogging({
  level: 'debug',
  sinks: ['console', 'file'],
  enableColors: true,
  enableStructuredLogging: true,
  defaultContext: {
    service: 'my-service',
    version: '1.0.0',
    environment: 'staging',
  },
})
```

### Available Log Levels

- `debug`: Detailed information for debugging
- `info`: General information about application flow
- `warning`: Something unexpected happened, but application is working
- `error`: Error occurred, but application can continue
- `fatal`: Critical error that may cause application to stop

## API Reference

### Core Interfaces

#### YekoLogContext

```typescript
interface YekoLogContext {
  // Tenant information
  schoolId?: string
  organizationId?: string

  // User information
  userId?: string
  userRole?: 'admin' | 'teacher' | 'student' | 'parent' | 'staff'
  sessionId?: string

  // Academic context
  academicYearId?: string
  semesterId?: string
  courseId?: string
  subjectId?: string

  // Request information
  requestId?: string
  ip?: string
  userAgent?: string

  // Performance metrics
  duration?: number
  memoryUsage?: number

  // Custom fields
  [key: string]: unknown
}
```

#### YekoLogger

```typescript
interface YekoLogger {
  // Standard logging methods
  debug: (message: string, context?: YekoLogContext) => void
  info: (message: string, context?: YekoLogContext) => void
  warning: (message: string, context?: YekoLogContext) => void
  error: (message: string, error?: Error, context?: YekoLogContext) => void
  fatal: (message: string, error?: Error, context?: YekoLogContext) => void

  // Yeko-specific methods
  audit: (message: string, context?: YekoLogContext) => void
  performance: (operation: string, duration: number, context?: YekoLogContext) => void
  security: (event: string, context?: YekoLogContext) => void

  // Context management
  withContext: (context: Partial<YekoLogContext>) => YekoLogger
  withUser: (userId: string, role: UserRole) => YekoLogger
  withSchool: (schoolId: string) => YekoLogger
  withAcademicContext: (academicYearId: string, semesterId?: string) => YekoLogger
}
```

### Utility Functions

#### Context Creation

```typescript
import {
  createAcademicContext,
  createSchoolContext,
  createUserContext
} from '@repo/logger'

const userContext = createUserContext('user-123', 'teacher', { sessionId: 'abc-123' })
const schoolContext = createSchoolContext('school-456', 'org-789')
const academicContext = createAcademicContext('year-2024', 'fall', 'math-101')
```

#### Performance Tracking

```typescript
import { PerformanceTracker } from '@repo/logger'

const tracker = PerformanceTracker.start('api-call', logger, { endpoint: '/api/users' })

// ... perform operation

tracker.end({ success: true, recordsProcessed: 150 })
```

## Best Practices

### 1. Use Context Effectively

```typescript
// ✅ Good - Use specific context
logger.info('Grade created', {
  userId: 'teacher-123',
  userRole: 'teacher',
  schoolId: 'school-456',
  courseId: 'math-101',
})

// ❌ Avoid - Generic messages without context
logger.info('Something happened')
```

### 2. Choose Appropriate Log Levels

```typescript
// ✅ Use appropriate levels
logger.debug('Processing user request', { userId: '123' })
logger.info('User logged in successfully', { userId: '123' })
logger.warning('User has overdue assignments', { userId: '123' })
logger.error('Failed to save grades', error, { userId: '123' })

// ❌ Don't use error for normal operations
logger.error('User clicked button') // This should be info or debug
```

### 3. Log Performance for Critical Operations

```typescript
// ✅ Track important operations
const tracker = PerformanceTracker.start('grade-import', logger, {
  studentCount: 150,
  schoolId: 'school-123',
})

// ... import grades

tracker.end({ gradesImported: 150, duration: 2500 })
```

### 4. Use Audit Logging for Sensitive Operations

```typescript
// ✅ Log sensitive operations for compliance
logger.audit('Student grades modified', {
  userId: 'teacher-123',
  targetUserId: 'student-456',
  courseId: 'math-101',
  oldGrade: 'B',
  newGrade: 'A',
  schoolId: 'school-789',
  timestamp: new Date().toISOString(),
})
```

## Migration Guide

### From Console Logging

```typescript
// ❌ Before
console.log('User logged in:', userId)
console.error('Database error:', error)

// ✅ After
logger.info('User logged in', { userId })
logger.error('Database error', error, { operation: 'user-login' })
```

### From Other Logging Libraries

```typescript
// ❌ Before (winston)
// ✅ After
import { createLogger, initLogging } from '@repo/logger'

const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
})
await initLogging()
const logger = createLogger(['app'])
```

## Testing

The logger includes test-specific configurations that make logs silent and provide utilities for testing:

```typescript
import { createLogger } from '@repo/logger'

// In test environment, logger will be silent
const logger = createLogger(['test-module'])

// You can capture logs for testing in test environments
```

## Security Considerations

- **Automatic Data Masking**: The logger automatically masks sensitive data like IP addresses
- **PII Protection**: Avoid logging personally identifiable information
- **Audit Trail**: Use audit logging for compliance requirements
- **Access Control**: Implement appropriate access controls for log files

## Contributing

1. Follow the existing code style and TypeScript patterns
2. Add appropriate tests for new functionality
3. Update documentation for new features
4. Ensure all examples work with the Yeko educational context

## License

MIT License - see LICENSE file for details.
