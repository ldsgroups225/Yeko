import { test } from '@playwright/test'

test('debug page state', async ({ page }) => {
  await page.goto('/login')
  await page.waitForTimeout(5000)
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true })
  console.warn('Page title:', await page.title())
  console.warn('Page content:', await page.content())
})
