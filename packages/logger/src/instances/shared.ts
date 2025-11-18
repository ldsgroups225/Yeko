/**
 * Shared logger implementation for both server and client
 */

import { configure, getLogger, type Logger as LogTapeLogger } from "@logtape/logtape";
import type { YekoLogger, YekoLogContext, LogLevel, LoggerConfig } from "../types";
import { mergeContext, normalizeContext, maskSensitiveData } from "../utils/context";
import { selectFormatter } from "../utils/formatters";

/**
 * Base Yeko Logger implementation
 */
export class BaseYekoLogger implements YekoLogger {
  private readonly logTapeLogger: LogTapeLogger;
  private readonly baseConfig: LoggerConfig;
  private readonly baseContext?: YekoLogContext;

  constructor(
    category: string[],
    config: LoggerConfig,
    baseContext?: YekoLogContext
  ) {
    this.logTapeLogger = getLogger(category);
    this.baseConfig = config;
    this.baseContext = baseContext;
  }

  // Standard logging methods
  debug(message: string, context?: YekoLogContext): void {
    this.log("debug", message, undefined, context);
  }

  info(message: string, context?: YekoLogContext): void {
    this.log("info", message, undefined, context);
  }

  warning(message: string, context?: YekoLogContext): void {
    this.log("warning", message, undefined, context);
  }

  error(message: string, error?: Error, context?: YekoLogContext): void {
    this.log("error", message, error, context);
  }

  fatal(message: string, error?: Error, context?: YekoLogContext): void {
    this.log("fatal", message, error, context);
  }

  // Yeko-specific methods
  audit(message: string, context?: YekoLogContext): void {
    this.log("info", message, undefined, { ...context, logType: "audit" });
  }

  performance(operation: string, duration: number, context?: YekoLogContext): void {
    this.log("info", `Performance: ${operation}`, undefined, {
      ...context,
      duration,
      logType: "performance",
    });
  }

  security(event: string, context?: YekoLogContext): void {
    this.log("warning", `Security: ${event}`, undefined, {
      ...context,
      logType: "security",
    });
  }

  // Context management
  withContext(context: Partial<YekoLogContext>): YekoLogger {
    return new BaseYekoLogger(
      this.getCategory(),
      this.baseConfig,
      mergeContext(this.baseContext, context)
    );
  }

  withUser(userId: string, role: string): YekoLogger {
    return this.withContext({ userId, userRole: role as any });
  }

  withSchool(schoolId: string): YekoLogger {
    return this.withContext({ schoolId });
  }

  withAcademicContext(academicYearId: string, semesterId?: string): YekoLogger {
    return this.withContext({ academicYearId, semesterId });
  }

  // Child logger creation
  child(category: string[]): YekoLogger {
    const currentCategory = this.getCategory();
    const newCategory = [...currentCategory, ...category];

    return new BaseYekoLogger(newCategory, this.baseConfig, this.baseContext);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: YekoLogContext
  ): void {
    const mergedContext = normalizeContext(
      mergeContext(this.baseContext, context)
    );

    const maskedContext = maskSensitiveData(mergedContext);

    // Use LogTape's structured logging
    const logMethod = this.getLogTapeMethod(level);

    if (error) {
      logMethod(`${message}`, {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        ...maskedContext,
      });
    } else {
      logMethod(`${message}`, maskedContext);
    }
  }

  /**
   * Get the appropriate LogTape method for the log level
   */
  private getLogTapeMethod(level: LogLevel): any {
    switch (level) {
      case "debug":
        return this.logTapeLogger.debug;
      case "info":
        return this.logTapeLogger.info;
      case "warning":
        return this.logTapeLogger.warn;
      case "error":
        return this.logTapeLogger.error;
      case "fatal":
        return this.logTapeLogger.error; // LogTape uses error for fatal
      default:
        return this.logTapeLogger.info;
    }
  }

  /**
   * Get the current category from the LogTape logger
   */
  private getCategory(): string[] {
    // LogTape doesn't expose category directly, so we'll need to track it
    // This is a simplified approach - in a real implementation,
    // you might need to store the category separately
    return ["yeko"];
  }
}

/**
 * Logger factory for creating Yeko loggers
 */
export class YekoLoggerFactory {
  private static instance: YekoLoggerFactory;
  private static isConfigured = false;
  private static config: LoggerConfig;

  private constructor() {}

  static getInstance(): YekoLoggerFactory {
    if (!YekoLoggerFactory.instance) {
      YekoLoggerFactory.instance = new YekoLoggerFactory();
    }
    return YekoLoggerFactory.instance;
  }

  /**
   * Configure LogTape with Yeko settings
   */
  async configure(config: LoggerConfig): Promise<void> {
    if (YekoLoggerFactory.isConfigured) {
      return; // Already configured
    }

    YekoLoggerFactory.config = config;

    const sinks = this.createSinks(config);
    const loggers = this.createLoggerConfigs(config);

    await configure({
      sinks,
      loggers,
    });

    YekoLoggerFactory.isConfigured = true;
  }

  /**
   * Create a new Yeko logger
   */
  create(category: string[], config?: Partial<LoggerConfig>): YekoLogger {
    const finalConfig = { ...YekoLoggerFactory.config, ...config };
    return new BaseYekoLogger(category, finalConfig);
  }

  /**
   * Create sinks for LogTape configuration
   */
  private createSinks(config: LoggerConfig) {
    const { getConsoleSink } = require("@logtape/logtape");
    const sinks: Record<string, any> = {};

    // Console sink
    if (config.sinks.includes("console")) {
      sinks.console = getConsoleSink();
    }

    // File sink (for production)
    if (config.sinks.includes("file")) {
      // Note: You would need to implement file sink
      // This would require additional dependencies like @logtape/file
    }

    return sinks;
  }

  /**
   * Create logger configurations for LogTape
   */
  private createLoggerConfigs(config: LoggerConfig) {
    return [
      {
        category: "yeko",
        lowestLevel: config.level,
        sinks: config.sinks,
      },
    ];
  }

  /**
   * Shutdown the logging system
   */
  async shutdown(): Promise<void> {
    // LogTape doesn't have a shutdown method in the current version
    // This would be used for cleanup if needed
    YekoLoggerFactory.isConfigured = false;
  }
}