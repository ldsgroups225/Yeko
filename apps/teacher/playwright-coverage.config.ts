import type { PlaywrightTestConfig } from '@playwright/test'
import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

interface CoverageConfig {
  provider: string
  reportDir: string
  reporter: string[]
  include: string[]
  exclude: string[]
}

type PlaywrightTestConfigWithCoverage = PlaywrightTestConfig & {
  coverage: CoverageConfig
}

const config: PlaywrightTestConfigWithCoverage = {
  testDir: './e2e-tests',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'coverage-report' }],
    ['json', { outputFile: 'coverage-results.json' }],
  ],
  globalSetup: './e2e-tests/setup/global.setup.ts',
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
    storageState: './e2e-tests/.auth/user.json',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev:yeko-teacher',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
  },

  // Coverage configuration
  coverage: {
    provider: 'v8',
    reportDir: './coverage',
    reporter: ['text', 'json', 'html', 'lcov'],
    include: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/**/*.spec.{ts,tsx}',
      '!src/**/*.test.{ts,tsx}',
      '!src/__tests__/**',
      '!src/**/*.stories.{ts,tsx}',
    ],
    exclude: [
      'src/main.tsx',
      'src/App.tsx',
      'src/routes/__root.tsx',
      'src/routes/index.tsx',
      'src/routes/login.tsx',
      'src/routes/api/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
    ],
  },
}

export default defineConfig(config)
