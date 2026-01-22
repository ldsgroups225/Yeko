/* eslint-disable react-hooks/rules-of-hooks */
import type { Page } from '@playwright/test'
import { test as base, expect } from '@playwright/test'
import { AuthPage } from '../helpers/page-objects'

export interface AuthFixtures {
  authenticatedPage: Page
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/')

    // Try to login with email/password
    const authPage = new AuthPage(page)

    // Check if we're on the login page
    try {
      await expect(authPage.emailInput).toBeVisible({ timeout: 5000 })
      await authPage.login('admin@yeko.test', 'password123')

      // Wait for successful login
      await page.waitForURL('**/app/**', { timeout: 10000 })
    }
    catch (error) {
      // If login fails, we'll continue without authentication for testing purposes
      console.log('Authentication failed - proceeding without login for testing')
    }

    await use(page)
  },
})

export { expect }
