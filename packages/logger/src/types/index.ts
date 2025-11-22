/**
 * Core types and interfaces for the Yeko logger package
 */

/**
 * Log levels supported by the logger
 */
export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'fatal'

/**
 * User roles in the Yeko educational platform
 */
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'staff'

/**
 * Environment types
 */
export type Environment = 'development' | 'production' | 'test'

/**
 * Yeko-specific logging context
 */
export interface YekoLogContext {
  // Tenant information
  schoolId?: string
  organizationId?: string

  // User information
  userId?: string
  userRole?: UserRole
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

  // Additional custom context
  [key: string]: unknown
}

/**
 * Structured log data interface
 */
export interface LogData {
  message: string
  level: LogLevel
  timestamp: Date
  context?: YekoLogContext
  error?: Error
  metadata?: Record<string, unknown>
}

/**
 * Logger configuration interface
 */
export interface LoggerConfig {
  level: LogLevel
  environment: Environment
  sinks: string[]
  formatters?: string[]
  enableColors?: boolean
  enableStructuredLogging?: boolean
  defaultContext?: Partial<YekoLogContext>
}

/**
 * Extended logger interface with Yeko-specific methods
 */
export interface YekoLogger {
  // Standard LogTape methods
  debug: (message: string, context?: YekoLogContext) => void
  info: (message: string, context?: YekoLogContext) => void
  warning: (message: string, context?: YekoLogContext) => void
  error: (message: string, error?: Error, context?: YekoLogContext) => void
  fatal: (message: string, error?: Error, context?: YekoLogContext) => void

  // Yeko-specific convenience methods
  audit: (message: string, context?: YekoLogContext) => void
  performance: (operation: string, duration: number, context?: YekoLogContext) => void
  security: (event: string, context?: YekoLogContext) => void

  // Context management
  withContext: (context: Partial<YekoLogContext>) => YekoLogger
  withUser: (userId: string, role: UserRole) => YekoLogger
  withSchool: (schoolId: string) => YekoLogger
  withAcademicContext: (academicYearId: string, semesterId?: string) => YekoLogger

  // Child logger creation
  child: (category: string[]) => YekoLogger
}

/**
 * Logger factory interface
 */
export interface LoggerFactory {
  create: (category: string[], config?: Partial<LoggerConfig>) => YekoLogger
  configure: (config: LoggerConfig) => Promise<void>
  shutdown: () => Promise<void>
}

/**
 * Performance monitoring interface
 */
export interface PerformanceLogger {
  startTimer: (operation: string, context?: YekoLogContext) => () => void
  logMetric: (name: string, value: number, unit?: string, context?: YekoLogContext) => void
}

/**
 * Audit logging interface for sensitive operations
 */
export interface AuditLogger {
  logUserAction: (action: string, targetUserId?: string, context?: YekoLogContext) => void
  logDataChange: (operation: string, entity: string, entityId: string, changes: Record<string, unknown>, context?: YekoLogContext) => void
  logSystemEvent: (event: string, severity: LogLevel, context?: YekoLogContext) => void
}

/**
 * Security event types
 */
export interface SecurityEvent {
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'permission_denied' | 'suspicious_activity' | 'data_access'
  userId?: string
  schoolId?: string
  ip?: string
  userAgent?: string
  details?: Record<string, unknown>
}

/**
 * Custom formatter interface
 */
export interface LogFormatter {
  name: string
  format: (logData: LogData) => string | Record<string, unknown>
}

/**
 * Log sink interface for different output destinations
 */
export interface LogSink {
  name: string
  write: (logData: LogData) => Promise<void> | void
}

/**
 * Logger metrics interface
 */
export interface LoggerMetrics {
  totalLogs: number
  logsByLevel: Record<LogLevel, number>
  errorsLogged: number
  warningsLogged: number
  averageLogSize: number
  lastLogTimestamp?: Date
}
