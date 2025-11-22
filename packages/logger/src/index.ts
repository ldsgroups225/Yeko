/**
 * Main exports for the Yeko logger package
 */

import type { LoggerConfig } from './types'

// Configuration exports
export { defaultConfig } from './config/default'

export { developmentConfig } from './config/development'
export { productionConfig } from './config/production'
export { testConfig } from './config/test'
// Client-side exports
export {
  apiClientLogger,
  ApiClientLogger,
  appLogger as clientAppLogger,
  performanceLogger as clientPerformanceLogger,
  ClientPerformanceTracker,
  createClientLogger,
  errorLogger,
  initClientLogging,
  setupGlobalErrorHandling,
  uiLogger,
  userActionLogger,
  UserInteractionLogger,
} from './instances/client'

// Server-side exports
export {
  apiLogger,
  authLogger,
  createServerLogger,
  databaseLogger,
  initServerLogging,
  PerformanceTracker,
  RequestLogger,
  securityLogger,
  appLogger as serverAppLogger,
  auditLogger as serverAuditLogger,
  performanceLogger as serverPerformanceLogger,
} from './instances/server'

// Factory exports
export { YekoLoggerFactory } from './instances/shared'

// Type exports
export type {
  AuditLogger,
  Environment,
  LogData,
  LogFormatter,
  LoggerConfig,
  LoggerFactory,
  LoggerMetrics,
  LogLevel,
  LogSink,
  PerformanceLogger,
  SecurityEvent,
  UserRole,
  YekoLogContext,
  YekoLogger,
} from './types'

// Utility exports
export {
  createAcademicContext,
  createPerformanceContext,
  createRequestContext,
  createSchoolContext,
  createUserContext,
  maskSensitiveData,
  mergeContext,
  normalizeContext,
} from './utils/context'

export {
  auditFormatter,
  consoleFormatter,
  jsonFormatter,
  performanceFormatter,
  selectFormatter,
  structuredFormatter,
} from './utils/formatters'

/**
 * Environment detection utility
 */
export function isServer(): boolean {
  return typeof window === 'undefined'
}

/**
 * Environment detection utility
 */
export function isClient(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Get current environment
 */
export function getEnvironment(): string {
  if (isServer()) {
    return process.env.NODE_ENV || 'development'
  }
  else {
    // In browser, we can't access process.env directly
    return 'development'
  }
}

/**
 * Convenience function to initialize logging automatically
 */
export async function initLogging(config?: Partial<LoggerConfig>): Promise<void> {
  if (isServer()) {
    const { initServerLogging } = await import('./instances/server')
    return initServerLogging(config)
  }
  else {
    const { initClientLogging } = await import('./instances/client')
    return initClientLogging(config)
  }
}

/**
 * Convenience function to create a logger with automatic environment detection
 */
export async function createLogger(category: string[] = ['yeko'], config?: Partial<LoggerConfig>) {
  if (isServer()) {
    const { createServerLogger } = await import('./instances/server')
    return createServerLogger(category, config)
  }
  else {
    const { createClientLogger } = await import('./instances/client')
    return createClientLogger(category, config)
  }
}

// Default export for convenience
export default {
  initLogging,
  createLogger,
  isServer,
  isClient,
  getEnvironment,
}
