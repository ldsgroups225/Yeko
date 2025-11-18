/**
 * Development environment configuration
 */

import type { LoggerConfig } from "../types";
import { defaultConfig } from "./default";

export const developmentConfig: LoggerConfig = {
  ...defaultConfig,
  level: "debug",
  environment: "development",
  sinks: ["console"],
  enableColors: true,
  enableStructuredLogging: false,
  defaultContext: {
    ...defaultConfig.defaultContext,
    environment: "development",
  },
};