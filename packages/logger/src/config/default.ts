/**
 * Default logger configuration for Yeko
 */

import type { LoggerConfig } from "../types";

export const defaultConfig: LoggerConfig = {
  level: "info",
  environment: "development",
  sinks: ["console"],
  enableColors: true,
  enableStructuredLogging: false,
  defaultContext: {
    service: "yeko",
    version: (typeof process !== "undefined" && process.env?.npm_package_version) || "1.0.0",
  },
};
