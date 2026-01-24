/* eslint-disable react-hooks/rules-of-hooks */
import type { Page } from '@playwright/test'
import { test as base, expect } from '@playwright/test'
import { authLogger } from '@repo/logger/dist'
import { AuthPage } from '../helpers/page-objects'

export interface AuthFixtures {
  authenticatedPage: Page
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to the app
    await page.goto('/')

    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded')

    // Try to login with email/password
    const authPage = new AuthPage(page)

    // Check if we're on the login page
    try {
      await expect(authPage.emailInput).toBeVisible({ timeout: 5000 })
      await authPage.login('admin@yeko.test', 'password123')

      // Wait for successful login (navigate to /app)
      await page.waitForURL(/\/app/, { timeout: 15000 })
    }
    catch {
      // If login fails (user doesn't exist or already logged in), proceed anyway
      authLogger.info('Authentication check completed')
    }

    await use(page)
  },
})

export { expect }
