/**
 * Main exports for the Yeko logger package
 */

import type { LoggerConfig } from "./types";

// Type exports
export type {
  LogLevel,
  UserRole,
  Environment,
  YekoLogContext,
  LogData,
  LoggerConfig,
  YekoLogger,
  LoggerFactory,
  PerformanceLogger,
  AuditLogger,
  SecurityEvent,
  LogFormatter,
  LogSink,
  LoggerMetrics,
} from "./types";

// Configuration exports
export { defaultConfig } from "./config/default";
export { developmentConfig } from "./config/development";
export { productionConfig } from "./config/production";
export { testConfig } from "./config/test";

// Utility exports
export {
  mergeContext,
  createUserContext,
  createSchoolContext,
  createAcademicContext,
  createRequestContext,
  createPerformanceContext,
  normalizeContext,
  maskSensitiveData,
} from "./utils/context";

export {
  consoleFormatter,
  jsonFormatter,
  structuredFormatter,
  auditFormatter,
  performanceFormatter,
  selectFormatter,
} from "./utils/formatters";

// Server-side exports
export {
  createServerLogger,
  appLogger as serverAppLogger,
  databaseLogger,
  authLogger,
  apiLogger,
  performanceLogger as serverPerformanceLogger,
  securityLogger,
  auditLogger as serverAuditLogger,
  initServerLogging,
  PerformanceTracker,
  RequestLogger,
} from "./instances/server";

// Client-side exports
export {
  createClientLogger,
  appLogger as clientAppLogger,
  uiLogger,
  apiClientLogger,
  performanceLogger as clientPerformanceLogger,
  errorLogger,
  userActionLogger,
  initClientLogging,
  ClientPerformanceTracker,
  UserInteractionLogger,
  ApiClientLogger,
  setupGlobalErrorHandling,
} from "./instances/client";

// Factory exports
export { YekoLoggerFactory } from "./instances/shared";

/**
 * Environment detection utility
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

/**
 * Environment detection utility
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * Get current environment
 */
export function getEnvironment(): string {
  if (isServer()) {
    return process.env.NODE_ENV || "development";
  } else {
    // In browser, we can't access process.env directly
    return "development";
  }
}

/**
 * Convenience function to initialize logging automatically
 */
export async function initLogging(config?: Partial<LoggerConfig>): Promise<void> {
  if (isServer()) {
    const { initServerLogging } = await import("./instances/server");
    return initServerLogging(config);
  } else {
    const { initClientLogging } = await import("./instances/client");
    return initClientLogging(config);
  }
}

/**
 * Convenience function to create a logger with automatic environment detection
 */
export async function createLogger(category: string[] = ["yeko"], config?: Partial<LoggerConfig>) {
  if (isServer()) {
    const { createServerLogger } = await import("./instances/server");
    return createServerLogger(category, config);
  } else {
    const { createClientLogger } = await import("./instances/client");
    return createClientLogger(category, config);
  }
}

// Default export for convenience
export default {
  initLogging,
  createLogger,
  isServer,
  isClient,
  getEnvironment,
};
