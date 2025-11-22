/**
 * Test environment configuration
 */

import type { LoggerConfig } from '../types'
import { defaultConfig } from './default'

export const testConfig: LoggerConfig = {
  ...defaultConfig,
  level: 'debug', // Allow all logs in tests
  environment: 'test',
  sinks: ['memory'], // Use memory sink for testing
  enableColors: false,
  enableStructuredLogging: true,
  defaultContext: {
    ...defaultConfig.defaultContext,
    environment: 'test',
  },
}
