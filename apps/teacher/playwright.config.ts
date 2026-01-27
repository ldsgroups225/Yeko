import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e-tests',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
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
    command: 'pnpm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
  },
})
