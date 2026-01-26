/* eslint-disable react-hooks/rules-of-hooks */
import type { Page } from '@playwright/test'
import { test as base, expect } from '@playwright/test'

export interface AuthFixtures {
  authenticatedPage: Page
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to the app - in dev mode, auth is bypassed
    await page.goto('/app')

    // Wait for redirect to dashboard
    await page.waitForURL(/\/app/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    await use(page)
  },
})

export { expect }
