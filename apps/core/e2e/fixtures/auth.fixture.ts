/* eslint-disable react-hooks/rules-of-hooks */
import type { Page } from '@playwright/test'
import { test as base, expect } from '@playwright/test'

export interface AuthFixtures {
  authenticatedPage: Page
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/auth/login')

    await page.fill('input[name="email"]', 'admin@yeko.test')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/dashboard', { timeout: 10000 })

    await use(page)
  },
})

export { expect }
