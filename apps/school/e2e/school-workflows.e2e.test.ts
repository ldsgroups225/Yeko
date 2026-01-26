import { expect, test } from '@playwright/test'

test.describe('School Workflows', () => {
  test('should display landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Yeko School/)
  })

  test('should have main content', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
