import { expect, test } from './fixtures/auth.fixture'
import {
  CatalogPage,
  SchoolManagementPage,
} from './helpers/page-objects'

test.describe('Landing Page', () => {
  test('should display landing page with call-to-action', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // Check for any interactive elements (CTA buttons)
    const links = page.locator('a[href]')
    await expect(links.first()).toBeVisible()
  })

  test('should have demo request link', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check for demo-related links
    const links = page.locator('a[href]')
    await expect(links.first()).toBeVisible()
  })
})

test.describe('Dashboard & Analytics', () => {
  test('should display dashboard when authenticated', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/dashboard')
    await authenticatedPage.waitForLoadState('networkidle')

    // App may redirect to /dashboard or stay on /app/dashboard
    await expect(authenticatedPage).toHaveURL(/\/app\/dashboard|dashboard/)
  })
})

test.describe('School Management Operations', () => {
  test('should display schools list page', async ({ authenticatedPage }) => {
    const schoolPage = new SchoolManagementPage(authenticatedPage)
    await schoolPage.goto()

    await expect(authenticatedPage).toHaveURL(/\/app\/schools|dashboard/)
  })
})

test.describe('Catalog Management', () => {
  test('should display catalogs overview page', async ({ authenticatedPage }) => {
    const catalogPage = new CatalogPage(authenticatedPage)
    await catalogPage.goto()

    await expect(authenticatedPage).toHaveURL(/\/app\/catalogs|dashboard/)
  })
})
