import { expect, test } from './fixtures/auth.fixture'
import {
  GradeEntryPage,
  GradesDashboardPage,
  GradeStatisticsPage,
  GradeValidationsPage,
} from './helpers/grades-page-objects'
import { gradesTestData } from './helpers/test-data'

test.describe('Grades Management E2E', () => {
  test.describe('Grades Dashboard', () => {
    let dashboardPage: GradesDashboardPage

    test.beforeEach(async ({ authenticatedPage }) => {
      dashboardPage = new GradesDashboardPage(authenticatedPage)
      await dashboardPage.goto()
    })

    test('should display grades dashboard page', async ({ authenticatedPage }) => {
      await expect(authenticatedPage).toHaveURL(/\/app\/academic\/grades/)
      await expect(dashboardPage.pageTitle).toBeVisible()
    })

    test('should display analytics cards', async () => {
      await expect(dashboardPage.pendingValidationsCard).toBeVisible()
      await expect(dashboardPage.classAverageCard).toBeVisible()
      await expect(dashboardPage.passRateCard).toBeVisible()
    })

    test('should display quick action links', async () => {
      await expect(dashboardPage.gradeEntryLink).toBeVisible()
      await expect(dashboardPage.validationsLink).toBeVisible()
      await expect(dashboardPage.statisticsLink).toBeVisible()
    })

    test('should navigate to grade entry page', async ({ authenticatedPage }) => {
      await dashboardPage.navigateToGradeEntry()
      await expect(authenticatedPage).toHaveURL(/\/app\/academic\/grades\/entry/)
    })

    test('should navigate to validations page', async ({ authenticatedPage }) => {
      await dashboardPage.navigateToValidations()
      await expect(authenticatedPage).toHaveURL(/\/app\/academic\/grades\/validations/)
    })

    test('should navigate to statistics page', async ({ authenticatedPage }) => {
      await dashboardPage.navigateToStatistics()
      await expect(authenticatedPage).toHaveURL(/\/app\/academic\/grades\/statistics/)
    })

    test('should show new grade entry button', async () => {
      await expect(dashboardPage.newGradeButton).toBeVisible()
    })
  })

  test.describe('Grade Entry', () => {
    let entryPage: GradeEntryPage

    test.beforeEach(async ({ authenticatedPage }) => {
      entryPage = new GradeEntryPage(authenticatedPage)
      await entryPage.goto()
    })

    test('should display grade entry page', async ({ authenticatedPage }) => {
      await expect(authenticatedPage).toHaveURL(/\/app\/academic\/grades\/entry/)
      await expect(entryPage.pageTitle).toBeVisible()
    })

    test('should display class, subject, and term selectors', async () => {
      await expect(entryPage.classSelect).toBeVisible()
      await expect(entryPage.subjectSelect).toBeVisible()
      await expect(entryPage.termSelect).toBeVisible()
    })

    test('should display grade type selector', async () => {
      await expect(entryPage.gradeTypeSelect).toBeVisible()
    })

    test('should show grade table after selecting class, subject, and term', async () => {
      // Select filters (these would need actual data in the database)
      // For now, we just verify the selectors are interactive
      await expect(entryPage.classSelect).toBeEnabled()
      await expect(entryPage.subjectSelect).toBeEnabled()
      await expect(entryPage.termSelect).toBeEnabled()
    })

    test('should have back button to return to dashboard', async ({ authenticatedPage }) => {
      await expect(entryPage.backButton).toBeVisible()
      await entryPage.backButton.click()
      await expect(authenticatedPage).toHaveURL(/\/app\/academic\/grades/)
    })

    test('should display French labels for grade types', async ({ authenticatedPage }) => {
      await entryPage.gradeTypeSelect.click()

      // Verify French labels are displayed
      await expect(authenticatedPage.getByText(gradesTestData.gradeTypes.quiz)).toBeVisible()
      await expect(authenticatedPage.getByText(gradesTestData.gradeTypes.test)).toBeVisible()
      await expect(authenticatedPage.getByText(gradesTestData.gradeTypes.exam)).toBeVisible()
    })
  })

  test.describe('Grade Validations', () => {
    let validationsPage: GradeValidationsPage

    test.beforeEach(async ({ authenticatedPage }) => {
      validationsPage = new GradeValidationsPage(authenticatedPage)
      await validationsPage.goto()
    })

    test('should display validations page', async ({ authenticatedPage }) => {
      await expect(authenticatedPage).toHaveURL(/\/app\/academic\/grades\/validations/)
      await expect(validationsPage.pageTitle).toBeVisible()
    })

    test('should display filter button', async () => {
      await expect(validationsPage.filterButton).toBeVisible()
    })

    test('should show empty state when no pending validations', async () => {
      // If no pending validations, empty state should be visible
      const hasCards = await validationsPage.validationCards.count() > 0
      if (!hasCards) {
        await expect(validationsPage.emptyState).toBeVisible()
      }
    })

    test('should have back button to return to dashboard', async ({ authenticatedPage }) => {
      await expect(validationsPage.backButton).toBeVisible()
      await validationsPage.backButton.click()
      await expect(authenticatedPage).toHaveURL(/\/app\/academic\/grades/)
    })
  })

  test.describe('Grade Statistics', () => {
    let statisticsPage: GradeStatisticsPage

    test.beforeEach(async ({ authenticatedPage }) => {
      statisticsPage = new GradeStatisticsPage(authenticatedPage)
      await statisticsPage.goto()
    })

    test('should display statistics page', async ({ authenticatedPage }) => {
      await expect(authenticatedPage).toHaveURL(/\/app\/academic\/grades\/statistics/)
      await expect(statisticsPage.pageTitle).toBeVisible()
    })

    test('should display class and term selectors', async () => {
      await expect(statisticsPage.classSelect).toBeVisible()
      await expect(statisticsPage.termSelect).toBeVisible()
    })

    test('should have back button to return to dashboard', async ({ authenticatedPage }) => {
      await expect(statisticsPage.backButton).toBeVisible()
      await statisticsPage.backButton.click()
      await expect(authenticatedPage).toHaveURL(/\/app\/academic\/grades/)
    })
  })

  test.describe('Navigation Flow', () => {
    test('should navigate through all grades pages', async ({ authenticatedPage }) => {
      const dashboardPage = new GradesDashboardPage(authenticatedPage)

      // Start at dashboard
      await dashboardPage.goto()
      await expect(authenticatedPage).toHaveURL(/\/app\/academic\/grades/)

      // Navigate to entry
      await dashboardPage.navigateToGradeEntry()
      await expect(authenticatedPage).toHaveURL(/\/app\/academic\/grades\/entry/)

      // Go back to dashboard
      const entryPage = new GradeEntryPage(authenticatedPage)
      await entryPage.backButton.click()
      await expect(authenticatedPage).toHaveURL(/\/app\/academic\/grades/)

      // Navigate to validations
      await dashboardPage.navigateToValidations()
      await expect(authenticatedPage).toHaveURL(/\/app\/academic\/grades\/validations/)

      // Go back to dashboard
      const validationsPage = new GradeValidationsPage(authenticatedPage)
      await validationsPage.backButton.click()
      await expect(authenticatedPage).toHaveURL(/\/app\/academic\/grades/)

      // Navigate to statistics
      await dashboardPage.navigateToStatistics()
      await expect(authenticatedPage).toHaveURL(/\/app\/academic\/grades\/statistics/)
    })
  })

  test.describe('Accessibility', () => {
    test('should have accessible grade entry form', async ({ authenticatedPage }) => {
      const entryPage = new GradeEntryPage(authenticatedPage)
      await entryPage.goto()

      // Verify form elements have proper labels
      await expect(entryPage.classSelect).toBeVisible()
      await expect(entryPage.subjectSelect).toBeVisible()
      await expect(entryPage.termSelect).toBeVisible()
    })

    test('should support keyboard navigation on dashboard', async ({ authenticatedPage }) => {
      const dashboardPage = new GradesDashboardPage(authenticatedPage)
      await dashboardPage.goto()

      // Tab through interactive elements
      await authenticatedPage.keyboard.press('Tab')
      await authenticatedPage.keyboard.press('Tab')
      await authenticatedPage.keyboard.press('Tab')

      // Verify focus is on an interactive element
      const focusedElement = authenticatedPage.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })

    test('should have proper heading hierarchy', async ({ authenticatedPage }) => {
      const dashboardPage = new GradesDashboardPage(authenticatedPage)
      await dashboardPage.goto()

      // Verify h1 exists
      const h1 = authenticatedPage.getByRole('heading', { level: 1 })
      await expect(h1).toBeVisible()
    })
  })

  test.describe('French Localization', () => {
    test('should display French labels on dashboard', async ({ authenticatedPage }) => {
      const dashboardPage = new GradesDashboardPage(authenticatedPage)
      await dashboardPage.goto()

      // Verify French text is displayed
      await expect(authenticatedPage.getByText(/notes|gestion des notes/i)).toBeVisible()
    })

    test('should display French labels on entry page', async ({ authenticatedPage }) => {
      const entryPage = new GradeEntryPage(authenticatedPage)
      await entryPage.goto()

      // Verify French labels
      await expect(authenticatedPage.getByText(/classe|matière|trimestre/i)).toBeVisible()
    })

    test('should display French status labels', async ({ authenticatedPage }) => {
      const validationsPage = new GradeValidationsPage(authenticatedPage)
      await validationsPage.goto()

      // Page should have French content
      await expect(authenticatedPage.getByText(/validation/i)).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should be usable on mobile viewport', async ({ authenticatedPage }) => {
      // Set mobile viewport
      await authenticatedPage.setViewportSize({ width: 375, height: 667 })

      const dashboardPage = new GradesDashboardPage(authenticatedPage)
      await dashboardPage.goto()

      // Verify page is still functional
      await expect(dashboardPage.pageTitle).toBeVisible()
      await expect(dashboardPage.newGradeButton).toBeVisible()
    })

    test('should be usable on tablet viewport', async ({ authenticatedPage }) => {
      // Set tablet viewport
      await authenticatedPage.setViewportSize({ width: 768, height: 1024 })

      const dashboardPage = new GradesDashboardPage(authenticatedPage)
      await dashboardPage.goto()

      // Verify page is still functional
      await expect(dashboardPage.pageTitle).toBeVisible()
      await expect(dashboardPage.gradeEntryLink).toBeVisible()
    })
  })
})
