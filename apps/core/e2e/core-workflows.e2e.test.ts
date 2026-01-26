import { expect, test } from './fixtures/auth.fixture'
import { DashboardPage, SchoolManagementPage } from './helpers/page-objects'

test.describe('Landing Page', () => {
  test('should display landing page with heading', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should have navigation links', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: /commencer|start|sign/i }).first()).toBeVisible()
  })
})

test.describe('Dashboard (Authenticated)', () => {
  test('should display dashboard when authenticated', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage)
    await dashboardPage.goto()

    await expect(authenticatedPage).toHaveURL(/\/app\/dashboard/)
  })

  test('should have app navigation', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/dashboard')
    await authenticatedPage.waitForLoadState('networkidle')

    await expect(authenticatedPage).toHaveURL(/\/app\/dashboard/)
  })
})

test.describe('Schools Management (Authenticated)', () => {
  test('should display schools page', async ({ authenticatedPage }) => {
    const schoolPage = new SchoolManagementPage(authenticatedPage)
    await schoolPage.goto()

    await expect(authenticatedPage).toHaveURL(/\/app\/schools/)
  })
})
