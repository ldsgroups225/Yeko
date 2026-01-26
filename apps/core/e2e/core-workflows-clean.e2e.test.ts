import { expect, test } from './fixtures/auth.fixture'
import {
  CatalogPage,
  DashboardPage,
  SchoolManagementPage,
} from './helpers/page-objects'

test.describe('Landing Page', () => {
  test('should display landing page with call-to-action', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: /commencer|start|sign/i }).first()).toBeVisible()
  })

  test('should have demo request link', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: /démo|demo/i }).first()).toBeVisible()
  })
})

test.describe('Dashboard & Analytics', () => {
  test('should display dashboard when authenticated', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage)
    await dashboardPage.goto()

    await expect(authenticatedPage).toHaveURL(/\/app\/dashboard/)
  })
})

test.describe('School Management Operations', () => {
  test('should display schools list page', async ({ authenticatedPage }) => {
    const schoolPage = new SchoolManagementPage(authenticatedPage)
    await schoolPage.goto()

    await expect(authenticatedPage).toHaveURL(/\/app\/schools/)
  })
})

test.describe('Catalog Management', () => {
  test('should display catalogs overview page', async ({ authenticatedPage }) => {
    const catalogPage = new CatalogPage(authenticatedPage)
    await catalogPage.goto()

    await expect(authenticatedPage).toHaveURL(/\/app\/catalogs/)
  })
})
