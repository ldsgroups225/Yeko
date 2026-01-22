import { expect, test } from './fixtures/auth.fixture'
import { AuthPage, DashboardPage, SchoolManagementPage } from './helpers/page-objects'

test.describe('Authentication & Session Management', () => {
  test('should display email login form', async ({ page }) => {
    await page.goto('/')

    const authPage = new AuthPage(page)
    await expect(authPage.emailInput).toBeVisible()
    await expect(authPage.passwordInput).toBeVisible()
    await expect(authPage.loginButton).toBeVisible()
  })

  test('should show Google OAuth button', async ({ page }) => {
    await page.goto('/')

    const authPage = new AuthPage(page)
    await expect(authPage.googleSignInButton).toBeVisible()
  })

  test('should have enabled login button when fields are filled', async ({ page }) => {
    await page.goto('/')

    const authPage = new AuthPage(page)
    await expect(authPage.emailInput).toBeVisible()
    await authPage.emailInput.fill('admin@yeko.test')
    await authPage.passwordInput.fill('password123')
    await expect(authPage.loginButton).toBeEnabled()
  })
})

test.describe('Dashboard (Authenticated)', () => {
  test('should display dashboard when authenticated', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage)
    await dashboardPage.goto()

    await expect(authenticatedPage).toHaveURL(/\/app/)
  })

  test('should display sidebar navigation', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app')

    const sidebar = authenticatedPage.locator('[class*="sidebar"]')
    await expect(sidebar).toBeVisible()
  })
})

test.describe('Schools Management (Authenticated)', () => {
  test('should display schools page', async ({ authenticatedPage }) => {
    const schoolPage = new SchoolManagementPage(authenticatedPage)
    await schoolPage.goto()

    await expect(authenticatedPage).toHaveURL(/\/schools/)
  })
})
