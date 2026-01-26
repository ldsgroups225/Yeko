import { expect, test } from '@playwright/test'

test.describe('School App Teacher Management', () => {
  test('should display landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Yeko School/)
  })
})
