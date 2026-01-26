/* eslint-disable react-hooks/rules-of-hooks */
import type { Page } from '@playwright/test'
import { test as base, expect } from '@playwright/test'

export interface AuthFixtures {
  authenticatedPage: Page
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('domcontentloaded')

    const emailInput = page.locator('input[name="email"], input[type="email"]').first()
    const isLoginVisible = await emailInput.isVisible({ timeout: 5000 }).catch(() => false)

    if (isLoginVisible) {
      await emailInput.fill('admin@yeko.test')
      await page.locator('input[name="password"], input[type="password"]').first().fill('password123')
      await page.locator('button[type="submit"]').first().click()
      await page.waitForTimeout(3000)
    }

    await use(page)
  },
})

export { expect }
