/**
 * Custom formatters for Yeko logging
 */

import type { LogData, LogFormatter, YekoLogContext } from "../types";
import { maskSensitiveData } from "./context";

/**
 * Console formatter with colors for development
 */
export const consoleFormatter: LogFormatter = {
  name: "console",
  format: (logData: LogData): string => {
    const { message, level, timestamp, context, error } = logData;

    const colors = {
      debug: "\x1b[36m", // Cyan
      info: "\x1b[32m",  // Green
      warning: "\x1b[33m", // Yellow
      error: "\x1b[31m",  // Red
      fatal: "\x1b[35m",  // Magenta
      reset: "\x1b[0m",   // Reset
    };

    const color = colors[level];
    const reset = colors.reset;
    const time = timestamp.toISOString();

    let formatted = `${color}[${time}] ${level.toUpperCase()}${reset} ${message}`;

    if (context) {
      const contextStr = formatContext(context);
      if (contextStr) {
        formatted += ` ${contextStr}`;
      }
    }

    if (error) {
      formatted += `\n${color}Error: ${error.message}${reset}`;
      if (error.stack) {
        formatted += `\n${error.stack}`;
      }
    }

    return formatted;
  },
};

/**
 * JSON formatter for production and structured logging
 */
export const jsonFormatter: LogFormatter = {
  name: "json",
  format: (logData: LogData): Record<string, unknown> => {
    const { message, level, timestamp, context, error, metadata } = logData;

    const logEntry: Record<string, unknown> = {
      timestamp: timestamp.toISOString(),
      level,
      message,
      service: "yeko",
    };

    if (context) {
      logEntry.context = maskSensitiveData(context);
    }

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (metadata) {
      logEntry.metadata = metadata;
    }

    return logEntry;
  },
};

/**
 * Structured formatter for log analysis tools
 */
export const structuredFormatter: LogFormatter = {
  name: "structured",
  format: (logData: LogData): string => {
    const jsonLog = jsonFormatter.format(logData);
    return JSON.stringify(jsonLog);
  },
};

/**
 * Audit-specific formatter for security events
 */
export const auditFormatter: LogFormatter = {
  name: "audit",
  format: (logData: LogData): Record<string, unknown> => {
    const base = jsonFormatter.format(logData) as Record<string, unknown>;

    return {
      ...base,
      logType: "audit",
      timestamp: new Date().toISOString(),
      // Add audit-specific fields
      category: "security",
      priority: logData.level === "error" || logData.level === "fatal" ? "high" : "medium",
    };
  },
};

/**
 * Performance-specific formatter
 */
export const performanceFormatter: LogFormatter = {
  name: "performance",
  format: (logData: LogData): Record<string, unknown> => {
    const base = jsonFormatter.format(logData) as Record<string, unknown>;

    return {
      ...base,
      logType: "performance",
      category: "metrics",
      // Performance-specific fields
      durationMs: logData.context?.duration,
      memoryUsageMB: logData.context?.memoryUsage ? (logData.context.memoryUsage as number) / 1024 / 1024 : undefined,
    };
  },
};

/**
 * Formats context object for console output
 */
function formatContext(context: YekoLogContext): string {
  const parts: string[] = [];

  if (context.schoolId) parts.push(`school:${context.schoolId}`);
  if (context.userId) parts.push(`user:${context.userId}`);
  if (context.userRole) parts.push(`role:${context.userRole}`);
  if (context.requestId) parts.push(`req:${context.requestId}`);
  if (context.duration) parts.push(`duration:${context.duration}ms`);
  if (context.academicYearId) parts.push(`year:${context.academicYearId}`);
  if (context.semesterId) parts.push(`semester:${context.semesterId}`);
  if (context.courseId) parts.push(`course:${context.courseId}`);

  return parts.length > 0 ? `[${parts.join(" ")}]` : "";
}

/**
 * Formatter selector based on environment and configuration
 */
export function selectFormatter(
  name: string,
  enableColors: boolean = false
): LogFormatter {
  switch (name) {
    case "console":
      return enableColors ? consoleFormatter : structuredFormatter;
    case "json":
      return jsonFormatter;
    case "structured":
      return structuredFormatter;
    case "audit":
      return auditFormatter;
    case "performance":
      return performanceFormatter;
    default:
      return structuredFormatter;
  }
}