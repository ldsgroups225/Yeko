/**
 * Server-side logger instance for Node.js and Cloudflare Workers
 */

import type { YekoLogger, LoggerConfig, Environment } from "../types";
import { YekoLoggerFactory } from "./shared";
import { developmentConfig } from "../config/development";
import { productionConfig } from "../config/production";
import { testConfig } from "../config/test";

/**
 * Get the appropriate configuration based on environment
 */
function getConfig(): LoggerConfig {
  const env = (process.env.NODE_ENV as Environment) || "development";

  switch (env) {
    case "production":
      return productionConfig;
    case "test":
      return testConfig;
    case "development":
    default:
      return developmentConfig;
  }
}

/**
 * Initialize the server logger
 */
async function initializeServerLogger(config?: Partial<LoggerConfig>): Promise<void> {
  const finalConfig = { ...getConfig(), ...config };

  // Add server-specific context
  finalConfig.defaultContext = {
    ...finalConfig.defaultContext,
    runtime: "server",
    platform: getPlatform(),
  };

  const factory = YekoLoggerFactory.getInstance();
  await factory.configure(finalConfig);
}

/**
 * Get the current platform information
 */
function getPlatform(): string {
  // Check if we're in Cloudflare Workers
  if (typeof globalThis !== "undefined" && globalThis.caches) {
    return "cloudflare-workers";
  }

  // Check if we're in Node.js
  if (typeof process !== "undefined" && process.versions?.node) {
    return `node-${process.versions.node}`;
  }

  // Default to unknown
  return "unknown";
}

/**
 * Create a server logger instance
 */
export function createServerLogger(
  category: string[] = ["server"],
  config?: Partial<LoggerConfig>
): YekoLogger {
  const factory = YekoLoggerFactory.getInstance();
  return factory.create(category, config);
}

/**
 * Pre-configured server loggers for different domains
 */

/**
 * Main application logger
 */
export const appLogger = createServerLogger(["app"]);

/**
 * Database logger
 */
export const databaseLogger = createServerLogger(["database"]);

/**
 * Authentication logger
 */
export const authLogger = createServerLogger(["auth"]);

/**
 * API logger for HTTP requests
 */
export const apiLogger = createServerLogger(["api"]);

/**
 * Performance logger
 */
export const performanceLogger = createServerLogger(["performance"]);

/**
 * Security logger for security events
 */
export const securityLogger = createServerLogger(["security"]);

/**
 * Audit logger for sensitive operations
 */
export const auditLogger = createServerLogger(["audit"]);

/**
 * Initialize server logging - call this once during application startup
 */
export async function initServerLogging(config?: Partial<LoggerConfig>): Promise<void> {
  await initializeServerLogger(config);
}

/**
 * Performance monitoring utilities
 */
export class PerformanceTracker {
  private readonly logger: YekoLogger;
  private readonly operation: string;
  private readonly context?: any;
  private startTime: number;

  constructor(operation: string, logger: YekoLogger = performanceLogger, context?: any) {
    this.operation = operation;
    this.logger = logger;
    this.context = context;
    this.startTime = Date.now();
  }

  /**
   * End the timer and log the duration
   */
  end(additionalContext?: any): void {
    const duration = Date.now() - this.startTime;
    this.logger.performance(this.operation, duration, {
      ...this.context,
      ...additionalContext,
    });
  }

  /**
   * Create a performance tracker
   */
  static start(operation: string, logger?: YekoLogger, context?: any): PerformanceTracker {
    return new PerformanceTracker(operation, logger, context);
  }
}

/**
 * HTTP request logging utilities
 */
export class RequestLogger {
  private readonly logger: YekoLogger;
  private readonly requestId: string;
  private readonly startTime: number;

  constructor(
    requestId: string,
    method: string,
    url: string,
    userAgent?: string,
    ip?: string
  ) {
    this.requestId = requestId;
    this.startTime = Date.now();

    this.logger = apiLogger.withContext({
      requestId,
      method,
      url,
      userAgent,
      ip,
    });

    this.logger.info(`Request started: ${method} ${url}`);
  }

  /**
   * Log successful response
   */
  success(statusCode: number, responseSize?: number): void {
    const duration = Date.now() - this.startTime;

    this.logger.info(`Request completed: ${statusCode}`, {
      statusCode,
      responseSize,
      duration,
    });
  }

  /**
   * Log error response
   */
  error(error: Error, statusCode?: number): void {
    const duration = Date.now() - this.startTime;

    this.logger.error(`Request failed: ${error.message}`, error, {
      statusCode,
      duration,
    });
  }

  /**
   * Log request with user context
   */
  withUser(userId: string, role: string): RequestLogger {
    this.logger.withUser(userId, role as any);
    return this;
  }

  /**
   * Log request with school context
   */
  withSchool(schoolId: string): RequestLogger {
    this.logger.withSchool(schoolId);
    return this;
  }
}

/**
 * Export initialization function for easy importing
 */
export default initServerLogging;