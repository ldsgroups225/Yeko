/**
 * Client-side logger instance for browser environments
 */

import type { LoggerConfig, YekoLogger } from '../types'
import { developmentConfig } from '../config/development'
import { productionConfig } from '../config/production'
import { testConfig } from '../config/test'
import { YekoLoggerFactory } from './shared'

/**
 * Get the appropriate configuration for client-side
 */
function getClientConfig(): LoggerConfig {
  // For client-side, we need to be more conservative about what we log
  const env = getEnvironment()

  switch (env) {
    case 'production':
      return {
        ...productionConfig,
        level: 'warning', // Only log warnings and errors in production
        sinks: ['console'], // Only console sink in browser
        enableColors: false,
        enableStructuredLogging: true,
        defaultContext: {
          ...productionConfig.defaultContext,
          runtime: 'client',
          platform: 'browser',
        },
      }
    case 'test':
      return {
        ...testConfig,
        sinks: ['memory'], // Silent in tests
        defaultContext: {
          ...testConfig.defaultContext,
          runtime: 'client',
          platform: 'browser',
        },
      }
    case 'development':
    default:
      return {
        ...developmentConfig,
        level: 'info', // More verbose in development
        sinks: ['console'],
        enableColors: true,
        enableStructuredLogging: false,
        defaultContext: {
          ...developmentConfig.defaultContext,
          runtime: 'client',
          platform: 'browser',
        },
      }
  }
}

/**
 * Get current environment from browser context
 */
function getEnvironment(): string {
  // Check if we're in a test environment
  if (typeof window !== 'undefined' && (window as any).__TEST__) {
    return 'test'
  }

  // Check hostname for production vs development
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development'
    }
    // Add your production domain checks here
    if (hostname.endsWith('yeko.app') || hostname.endsWith('yeko.com')) {
      return 'production'
    }
  }

  return 'development'
}

/**
 * Initialize the client logger
 */
async function initializeClientLogger(config?: Partial<LoggerConfig>): Promise<void> {
  const finalConfig = { ...getClientConfig(), ...config }

  const factory = YekoLoggerFactory.getInstance()
  await factory.configure(finalConfig)
}

/**
 * Create a client logger instance
 */
export function createClientLogger(
  category: string[] = ['client'],
  config?: Partial<LoggerConfig>,
): YekoLogger {
  const factory = YekoLoggerFactory.getInstance()
  return factory.create(category, config)
}

/**
 * Pre-configured client loggers for different domains
 */

/**
 * Main application logger
 */
export const appLogger = createClientLogger(['app'])

/**
 * UI logger for user interface events
 */
export const uiLogger = createClientLogger(['ui'])

/**
 * API client logger for HTTP requests
 */
export const apiClientLogger = createClientLogger(['api'])

/**
 * Performance logger for client-side performance
 */
export const performanceLogger = createClientLogger(['performance'])

/**
 * Error logger for client-side errors
 */
export const errorLogger = createClientLogger(['error'])

/**
 * User interaction logger
 */
export const userActionLogger = createClientLogger(['user-action'])

/**
 * Initialize client logging - call this once during application startup
 */
export async function initClientLogging(config?: Partial<LoggerConfig>): Promise<void> {
  await initializeClientLogger(config)
}

/**
 * Client-side performance monitoring
 */
export class ClientPerformanceTracker {
  private readonly logger: YekoLogger
  private readonly operation: string
  private readonly context?: any
  private startTime: number

  constructor(operation: string, logger: YekoLogger = performanceLogger, context?: any) {
    this.operation = operation
    this.logger = logger
    this.context = context
    this.startTime = performance.now()
  }

  /**
   * End the timer and log the duration
   */
  end(additionalContext?: any): void {
    const duration = Math.round(performance.now() - this.startTime)
    this.logger.performance(this.operation, duration, {
      ...this.context,
      ...additionalContext,
    })
  }

  /**
   * Create a performance tracker
   */
  static start(operation: string, logger?: YekoLogger, context?: any): ClientPerformanceTracker {
    return new ClientPerformanceTracker(operation, logger, context)
  }
}

/**
 * User interaction logging utilities
 */
export class UserInteractionLogger {
  private readonly logger: YekoLogger
  private readonly baseContext: any

  constructor(userId?: string, userRole?: string) {
    this.logger = userActionLogger
    this.baseContext = {
      userId,
      userRole,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Log a user action
   */
  logAction(action: string, element?: string, additionalContext?: any): void {
    this.logger.info(`User action: ${action}`, {
      ...this.baseContext,
      action,
      element,
      ...additionalContext,
    })
  }

  /**
   * Log navigation
   */
  logNavigation(from: string, to: string): void {
    this.logger.info(`Navigation: ${from} → ${to}`, {
      ...this.baseContext,
      navigation: true,
      from,
      to,
    })
  }

  /**
   * Log form submission
   */
  logFormSubmission(formName: string, fields?: string[]): void {
    this.logger.info(`Form submitted: ${formName}`, {
      ...this.baseContext,
      formSubmission: true,
      formName,
      fieldCount: fields?.length,
    })
  }

  /**
   * Log error encountered by user
   */
  logError(error: Error, context?: string): void {
    this.logger.error(`User encountered error: ${error.message}`, error, {
      ...this.baseContext,
      userContext: context,
    })
  }

  /**
   * Create a new logger with updated user context
   */
  withUser(userId: string, userRole: string): UserInteractionLogger {
    return new UserInteractionLogger(userId, userRole)
  }
}

/**
 * API client request logging
 */
export class ApiClientLogger {
  private readonly logger: YekoLogger
  private readonly requestId: string
  private readonly startTime: number

  constructor(method: string, url: string) {
    this.requestId = this.generateRequestId()
    this.startTime = performance.now()

    this.logger = apiClientLogger.withContext({
      requestId: this.requestId,
      method,
      url,
      client: true,
    })

    this.logger.info(`API request started: ${method} ${url}`)
  }

  /**
   * Log successful response
   */
  success(statusCode: number, responseSize?: number): void {
    const duration = Math.round(performance.now() - this.startTime)

    this.logger.info(`API request completed: ${statusCode}`, {
      statusCode,
      responseSize,
      duration,
    })
  }

  /**
   * Log error response
   */
  error(error: Error, statusCode?: number): void {
    const duration = Math.round(performance.now() - this.startTime)

    this.logger.error(`API request failed: ${error.message}`, error, {
      statusCode,
      duration,
    })
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Global error handler for client-side errors
 */
export function setupGlobalErrorHandling(): void {
  if (typeof window === 'undefined')
    return

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.error('Unhandled promise rejection', new Error(event.reason), {
      type: 'unhandled-rejection',
    })
  })

  // Catch uncaught errors (in some browsers)
  window.addEventListener('error', (event) => {
    errorLogger.error('Uncaught error', event.error, {
      type: 'uncaught-error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })
}

/**
 * Export initialization function for easy importing
 */
export default initClientLogging
