/**
 * Production environment configuration
 */

import type { LoggerConfig } from "../types";
import { defaultConfig } from "./default";

export const productionConfig: LoggerConfig = {
  ...defaultConfig,
  level: "info",
  environment: "production",
  sinks: ["console", "structured"],
  enableColors: false,
  enableStructuredLogging: true,
  defaultContext: {
    ...defaultConfig.defaultContext,
    environment: "production",
  },
};