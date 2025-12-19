/* eslint-disable react-hooks/rules-of-hooks */
import type { Page } from '@playwright/test'
import { test as base } from '@playwright/test'

/**
 * Authentication fixture for E2E tests
 * Provides authenticated page context for testing protected routes
 */

export interface AuthFixtures {
  authenticatedPage: Page
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/auth/login')

    // Perform login (adjust selectors based on your actual login form)
    await page.fill('input[name="email"]', 'admin@yeko.test')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Wait for navigation to complete
    await page.waitForURL('**/dashboard', { timeout: 10000 })

    // Use the authenticated page
    await use(page)
  },
})

export { expect } from '@playwright/test'
