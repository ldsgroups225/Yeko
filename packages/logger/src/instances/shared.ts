/**
 * Shared logger implementation for both server and client
 */

import type { Logger as LogTapeLogger } from '@logtape/logtape'
import type { LoggerConfig, LogLevel, UserRole, YekoLogContext, YekoLogger } from '../types'
import { configure, getConsoleSink, getLogger } from '@logtape/logtape'
import { maskSensitiveData, mergeContext, normalizeContext } from '../utils/context'

/**
 * Base Yeko Logger implementation
 */
export class BaseYekoLogger implements YekoLogger {
  private readonly _category: string[]
  private readonly baseConfig: LoggerConfig
  private readonly baseContext?: YekoLogContext

  constructor(
    category: string[],
    config: LoggerConfig,
    baseContext?: YekoLogContext,
  ) {
    this._category = category
    this.baseConfig = config
    this.baseContext = baseContext

    // Bind methods to allow destructuring
    this.debug = this.debug.bind(this)
    this.info = this.info.bind(this)
    this.warning = this.warning.bind(this)
    this.error = this.error.bind(this)
    this.fatal = this.fatal.bind(this)
    this.audit = this.audit.bind(this)
    this.performance = this.performance.bind(this)
    this.security = this.security.bind(this)
  }

  // Standard logging methods
  debug(message: string, context?: YekoLogContext): void {
    this.log('debug', message, undefined, context)
  }

  info(message: string, context?: YekoLogContext): void {
    this.log('info', message, undefined, context)
  }

  warning(message: string, context?: YekoLogContext): void {
    this.log('warning', message, undefined, context)
  }

  error(message: string, error?: Error, context?: YekoLogContext): void {
    this.log('error', message, error, context)
  }

  fatal(message: string, error?: Error, context?: YekoLogContext): void {
    this.log('fatal', message, error, context)
  }

  // Yeko-specific methods
  audit(message: string, context?: YekoLogContext): void {
    this.log('info', message, undefined, { ...context, logType: 'audit' })
  }

  performance(operation: string, duration: number, context?: YekoLogContext): void {
    this.log('info', `Performance: ${operation}`, undefined, {
      ...context,
      duration,
      logType: 'performance',
    })
  }

  security(event: string, context?: YekoLogContext): void {
    this.log('warning', `Security: ${event}`, undefined, {
      ...context,
      logType: 'security',
    })
  }

  // Context management
  withContext(context: Partial<YekoLogContext>): YekoLogger {
    return new BaseYekoLogger(
      this.getCategory(),
      this.baseConfig,
      mergeContext(this.baseContext, context),
    )
  }

  withUser(userId: string, role: UserRole): YekoLogger {
    return this.withContext({ userId, userRole: role })
  }

  withSchool(schoolId: string): YekoLogger {
    return this.withContext({ schoolId })
  }

  withAcademicContext(academicYearId: string, semesterId?: string): YekoLogger {
    return this.withContext({ academicYearId, semesterId })
  }

  // Child logger creation
  child(category: string[]): YekoLogger {
    const currentCategory = this.getCategory()
    const newCategory = [...currentCategory, ...category]

    return new BaseYekoLogger(newCategory, this.baseConfig, this.baseContext)
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: YekoLogContext,
  ): void {
    const mergedContext = normalizeContext(
      mergeContext(this.baseContext, context),
    )

    const maskedContext = maskSensitiveData(mergedContext)

    // Use LogTape's structured logging
    const logMethod = this.getLogTapeMethod(level)

    if (error) {
      logMethod(`${message}`, {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        ...maskedContext,
      })
    }
    else {
      logMethod(`${message}`, maskedContext)
    }
  }

  /**
   * Get a fresh LogTape logger for the current request context.
   * Called per-log to avoid caching I/O objects (SpanParent) across
   * requests in Cloudflare Workers.
   */
  private getLogTapeLogger(): LogTapeLogger {
    return getLogger(this._category)
  }

  /**
   * Get the appropriate LogTape method for the log level
   */
  private getLogTapeMethod(level: LogLevel): any {
    const logger = this.getLogTapeLogger()
    switch (level) {
      case 'debug':
        return logger.debug.bind(logger)
      case 'info':
        return logger.info.bind(logger)
      case 'warning':
        return logger.warn.bind(logger)
      case 'error':
        return logger.error.bind(logger)
      case 'fatal':
        return logger.error.bind(logger) // LogTape uses error for fatal
      default:
        return logger.info.bind(logger)
    }
  }

  /**
   * Get the current category
   */
  private getCategory(): string[] {
    return this._category
  }
}

/**
 * Logger factory for creating Yeko loggers
 */
export class YekoLoggerFactory {
  private static instance: YekoLoggerFactory
  private static isConfigured = false
  private static config: LoggerConfig

  private constructor() { }

  static getInstance(): YekoLoggerFactory {
    if (!YekoLoggerFactory.instance) {
      YekoLoggerFactory.instance = new YekoLoggerFactory()
    }
    return YekoLoggerFactory.instance
  }

  /**
   * Configure LogTape with Yeko settings
   */
  async configure(config: LoggerConfig, reset = false): Promise<void> {
    if (YekoLoggerFactory.isConfigured && !reset) {
      return // Already configured
    }

    YekoLoggerFactory.config = config

    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined'

    if (isBrowser) {
      // In browser, skip LogTape configuration as it uses Node.js APIs
      // LogTape will use default configuration
      YekoLoggerFactory.isConfigured = true
      return
    }

    const sinks = this.createSinks(config)
    const loggers = this.createLoggerConfigs(config)

    await configure({
      sinks,
      loggers,
      reset, // Pass reset flag to LogTape
    })

    YekoLoggerFactory.isConfigured = true
  }

  /**
   * Create a new Yeko logger
   */
  create(category: string[], config?: Partial<LoggerConfig>): YekoLogger {
    const finalConfig = { ...YekoLoggerFactory.config, ...config }
    return new BaseYekoLogger(category, finalConfig)
  }

  /**
   * Create sinks for LogTape configuration
   */
  private createSinks(config: LoggerConfig) {
    const sinks: Record<string, any> = {}

    // Console sink
    if (config.sinks.includes('console')) {
      sinks.console = getConsoleSink()
    }

    // File sink (for production)
    if (config.sinks.includes('file')) {
      // Note: You would need to implement file sink
      // This would require additional dependencies like @logtape/file
    }

    return sinks
  }

  /**
   * Create logger configurations for LogTape
   */
  private createLoggerConfigs(config: LoggerConfig) {
    return [
      {
        category: 'yeko',
        lowestLevel: config.level,
        sinks: config.sinks,
      },
    ]
  }

  /**
   * Shutdown the logging system
   */
  async shutdown(): Promise<void> {
    // LogTape doesn't have a shutdown method in the current version
    // This would be used for cleanup if needed
    YekoLoggerFactory.isConfigured = false
  }
}
