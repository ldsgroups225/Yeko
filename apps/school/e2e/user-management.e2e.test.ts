import { expect, test } from '@playwright/test'

test.describe('School App Landing Page', () => {
  test('should display landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Yeko School/)
  })

  test('should have main heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should have call-to-action links', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link').first()).toBeVisible()
  })
})
