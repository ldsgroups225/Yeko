import { expect, test } from './fixtures/auth.fixture'
import {
  AuthPage,
  CatalogPage,
  DashboardPage,
  SchoolManagementPage,
} from './helpers/page-objects'

test.describe('Authentication & Session Management', () => {
  test('should display email login page', async ({ page }) => {
    await page.goto('/')

    const authPage = new AuthPage(page)
    await expect(authPage.emailInput).toBeVisible()
    await expect(authPage.passwordInput).toBeVisible()
    await expect(authPage.loginButton).toBeVisible()
    await expect(authPage.googleSignInButton).toBeVisible()
  })

  test('should handle email login', async ({ page }) => {
    await page.goto('/')

    const authPage = new AuthPage(page)
    await expect(authPage.emailInput).toBeVisible()

    // Try to login (may fail if user doesn't exist, but we test the UI)
    await authPage.emailInput.fill('admin@yeko.test')
    await authPage.passwordInput.fill('password123')
    await expect(authPage.loginButton).toBeEnabled()
  })

  test('should show Google OAuth option', async ({ page }) => {
    await page.goto('/')

    const authPage = new AuthPage(page)
    await expect(authPage.googleSignInButton).toBeVisible()
    await expect(authPage.googleSignInButton).toContainText(/google/i)
  })
})

test.describe('Dashboard & Analytics', () => {
  test('should display dashboard when authenticated', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage)
    await dashboardPage.goto()

    await expect(dashboardPage.pageHeader).toBeVisible()
  })
})

test.describe('School Management Operations', () => {
  test('should display schools list page', async ({ authenticatedPage }) => {
    const schoolPage = new SchoolManagementPage(authenticatedPage)
    await schoolPage.goto()

    await expect(schoolPage.pageHeader).toContainText(/écoles|schools/i)
  })
})

test.describe('Catalog Management', () => {
  test('should display catalogs overview page', async ({ authenticatedPage }) => {
    const catalogPage = new CatalogPage(authenticatedPage)
    await catalogPage.goto()

    await expect(catalogPage.pageHeader).toContainText(/catalogues|catalogs/i)
  })
})
