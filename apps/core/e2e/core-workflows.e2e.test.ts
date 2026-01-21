import { expect, test } from './fixtures/auth.fixture'
import {
  AnalyticsPage,
  AuthPage,
  CatalogPage,
  CoefficientsPage,
  DashboardPage,
  GradesPage,
  ProgramsPage,
  SchoolCreatePage,
  SchoolEditPage,
  SchoolManagementPage,
  SchoolYearsPage,
  SubjectsPage,
} from './helpers/page-objects'
import {
  generateAcademicYear,
  generateIvorianPhone,
  generateUniqueSchoolCode,
  generateUniqueSchoolName,
} from './helpers/test-data'

test.describe('Authentication & Session Management', () => {
  test('should display login page and handle user login', async ({ page }) => {
    await page.goto('/auth/login')

    const authPage = new AuthPage(page)
    await expect(authPage.emailInput).toBeVisible()
    await expect(authPage.passwordInput).toBeVisible()
    await expect(authPage.loginButton).toBeVisible()

    await authPage.login('admin@yeko.test', 'password123')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(authPage.userMenu).toBeVisible()
  })

  test('should persist session after page reload', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')
    await expect(authenticatedPage).toHaveURL(/\/dashboard/)

    await authenticatedPage.reload()
    await expect(authenticatedPage).toHaveURL(/\/dashboard/)
  })

  test('should handle session timeout gracefully', async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', 'admin@yeko.test')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login|login/)
  })

  test('should logout user successfully', async ({ authenticatedPage }) => {
    const authPage = new AuthPage(authenticatedPage)
    await authPage.logout()

    await expect(authenticatedPage).toHaveURL(/\/auth\/login|login/)
  })

  test('should display validation errors for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')

    const authPage = new AuthPage(page)
    await authPage.login('invalid@email.com', 'wrongpassword')

    await expect(authPage.errorMessage).toBeVisible()
    await expect(authPage.errorMessage).toContainText(/invalid|incorrect|error/i)
  })

  test('should show password reset link on login page', async ({ page }) => {
    await page.goto('/auth/login')

    const authPage = new AuthPage(page)
    await expect(authPage.forgotPasswordLink).toBeVisible()
  })

  test('should navigate to password reset flow', async ({ page }) => {
    await page.goto('/auth/login')

    const authPage = new AuthPage(page)
    await authPage.forgotPasswordLink.click()

    await expect(page).toHaveURL(/password|reset|forgot/)
    await expect(authPage.resetEmailInput).toBeVisible()
  })
})

test.describe('School Management Operations', () => {
  test('should display schools list page', async ({ authenticatedPage }) => {
    const schoolPage = new SchoolManagementPage(authenticatedPage)
    await schoolPage.goto()

    await expect(schoolPage.pageHeader).toContainText(/écoles|schools/i)
    await expect(schoolPage.addSchoolButton).toBeVisible()
  })

  test('should create a new school with basic information', async ({ authenticatedPage }) => {
    const createPage = new SchoolCreatePage(authenticatedPage)
    await createPage.goto()

    const schoolName = generateUniqueSchoolName('Test School')
    const schoolCode = generateUniqueSchoolCode()

    await createPage.fillSchoolName(schoolName)
    await createPage.fillSchoolCode(schoolCode)
    await createPage.fillAddress('123 Test Street, Abidjan')
    await createPage.fillPhone(generateIvorianPhone())
    await createPage.fillEmail(`contact@${schoolCode.toLowerCase()}.ci`)

    await createPage.submit()

    await expect(authenticatedPage).toHaveURL(/\/schools/)
    await expect(authenticatedPage.getByText(schoolName)).toBeVisible()
  })

  test('should display validation errors for missing required fields', async ({ authenticatedPage }) => {
    const createPage = new SchoolCreatePage(authenticatedPage)
    await createPage.goto()

    await createPage.submit()

    await expect(createPage.nameError).toBeVisible()
    await expect(createPage.codeError).toBeVisible()
  })

  test('should upload school logo', async ({ authenticatedPage }) => {
    const createPage = new SchoolCreatePage(authenticatedPage)
    await createPage.goto()

    const schoolName = generateUniqueSchoolName('Logo School')
    const schoolCode = generateUniqueSchoolCode()

    await createPage.fillSchoolName(schoolName)
    await createPage.fillSchoolCode(schoolCode)
    await createPage.uploadLogo('test-logo.png')

    await expect(createPage.logoPreview).toBeVisible()
  })

  test('should edit existing school information', async ({ authenticatedPage }) => {
    const schoolPage = new SchoolManagementPage(authenticatedPage)
    await schoolPage.goto()

    const editPage = new SchoolEditPage(authenticatedPage)

    await schoolPage.clickFirstSchoolEdit()
    await expect(editPage.pageHeader).toContainText(/modifier|éditer|edit/i)

    await editPage.clearSchoolName()
    await editPage.fillSchoolName(generateUniqueSchoolName('Updated School'))
    await editPage.submit()

    await expect(authenticatedPage).toHaveURL(/\/schools\/[^/]+$/)
  })

  test('should change school status', async ({ authenticatedPage }) => {
    const schoolPage = new SchoolManagementPage(authenticatedPage)
    await schoolPage.goto()

    await schoolPage.clickFirstSchoolMenu()
    await schoolPage.clickStatusOption('suspended')

    await expect(schoolPage.statusBadge).toContainText(/suspendue|suspended/i)
  })

  test('should delete school with confirmation', async ({ authenticatedPage }) => {
    const createPage = new SchoolCreatePage(authenticatedPage)
    await createPage.goto()

    const schoolName = generateUniqueSchoolName('School to Delete')
    const schoolCode = generateUniqueSchoolCode()

    await createPage.fillSchoolName(schoolName)
    await createPage.fillSchoolCode(schoolCode)
    await createPage.submit()

    const schoolPage = new SchoolManagementPage(authenticatedPage)
    await schoolPage.goto()

    await schoolPage.clickFirstSchoolMenu()
    await schoolPage.clickDeleteOption()

    await expect(schoolPage.confirmDeleteDialog).toBeVisible()
    await schoolPage.confirmDeleteByTyping(schoolCode)
    await schoolPage.confirmDeleteButton.click()

    await expect(authenticatedPage.getByText(schoolName)).not.toBeVisible()
  })

  test('should filter schools by status', async ({ authenticatedPage }) => {
    const schoolPage = new SchoolManagementPage(authenticatedPage)
    await schoolPage.goto()

    await schoolPage.statusFilter.selectOption('active')

    await expect(schoolPage.firstSchoolRow).toBeVisible()
  })

  test('should search schools by name', async ({ authenticatedPage }) => {
    const schoolPage = new SchoolManagementPage(authenticatedPage)
    await schoolPage.goto()

    await schoolPage.searchInput.fill('Test School')

    await expect(schoolPage.firstSchoolRow).toContainText(/test/i)
  })

  test('should export schools to Excel', async ({ authenticatedPage }) => {
    const schoolPage = new SchoolManagementPage(authenticatedPage)
    await schoolPage.goto()

    await schoolPage.exportButton.click()

    const download = await schoolPage.page.waitForEvent('download')
    expect(download.suggestedFilename()).toMatch(/\.xlsx?$/i)
  })

  test('should import schools from Excel', async ({ authenticatedPage }) => {
    const schoolPage = new SchoolManagementPage(authenticatedPage)
    await schoolPage.goto()

    await schoolPage.importButton.click()
    await schoolPage.uploadImportFile('schools-import-template.xlsx')

    await expect(schoolPage.importSuccessToast).toBeVisible()
  })
})

test.describe('Dashboard & Analytics', () => {
  test('should display dashboard with statistics', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage)
    await dashboardPage.goto()

    await expect(dashboardPage.pageHeader).toContainText(/tableau de bord|dashboard/i)
    await expect(dashboardPage.statsCards.first()).toBeVisible()

    await expect(dashboardPage.totalSchoolsCard).toContainText(/\d+/)
    await expect(dashboardPage.activeSchoolsCard).toContainText(/\d+/)
  })

  test('should display recent schools on dashboard', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage)
    await dashboardPage.goto()

    await expect(dashboardPage.recentSchoolsSection).toBeVisible()
  })

  test('should display system health status', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage)
    await dashboardPage.goto()

    await expect(dashboardPage.systemHealthSection).toBeVisible()
    await expect(dashboardPage.databaseStatus).toContainText(/healthy|ok|connecté/i)
    await expect(dashboardPage.apiStatus).toContainText(/healthy|ok|connecté/i)
  })

  test('should display activity feed', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage)
    await dashboardPage.goto()

    await expect(dashboardPage.activityFeed).toBeVisible()
  })

  test('should navigate to quick actions', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage)
    await dashboardPage.goto()

    await dashboardPage.clickQuickAction('Ajouter une école')
    await expect(authenticatedPage).toHaveURL(/\/schools\/create/)
  })

  test('should display analytics page with overview', async ({ authenticatedPage }) => {
    const analyticsPage = new AnalyticsPage(authenticatedPage)
    await analyticsPage.goto()

    await expect(analyticsPage.pageHeader).toContainText(/analytiques|analytics/i)
    await expect(analyticsPage.overviewTab).toBeVisible()
    await expect(analyticsPage.totalSchoolsMetric).toContainText(/\d+/)
    await expect(analyticsPage.activeUsersMetric).toContainText(/\d+/)
  })

  test('should filter analytics by time range', async ({ authenticatedPage }) => {
    const analyticsPage = new AnalyticsPage(authenticatedPage)
    await analyticsPage.goto()

    await analyticsPage.timeRangeSelect.selectOption('90d')

    await expect(analyticsPage.page).toHaveURL(/timeRange|period|90d/)
  })

  test('should export analytics report to Excel', async ({ authenticatedPage }) => {
    const analyticsPage = new AnalyticsPage(authenticatedPage)
    await analyticsPage.goto()

    await analyticsPage.exportExcelButton.click()

    const download = await analyticsPage.page.waitForEvent('download')
    expect(download.suggestedFilename()).toMatch(/\.xlsx?$/i)
  })

  test('should display schools performance tab', async ({ authenticatedPage }) => {
    const analyticsPage = new AnalyticsPage(authenticatedPage)
    await analyticsPage.goto()

    await analyticsPage.schoolsPerformanceTab.click()

    await expect(analyticsPage.schoolsByStatusSection).toBeVisible()
  })

  test('should display platform usage tab', async ({ authenticatedPage }) => {
    const analyticsPage = new AnalyticsPage(authenticatedPage)
    await analyticsPage.goto()

    await analyticsPage.usageTab.click()

    await expect(analyticsPage.dailyActiveUsersSection).toBeVisible()
  })
})

test.describe('Catalog Management', () => {
  test('should display catalogs overview page', async ({ authenticatedPage }) => {
    const catalogPage = new CatalogPage(authenticatedPage)
    await catalogPage.goto()

    await expect(catalogPage.pageHeader).toContainText(/catalogues|catalogs/i)
    await expect(catalogPage.educationLevelsCard).toBeVisible()
    await expect(catalogPage.gradesCard).toBeVisible()
    await expect(catalogPage.subjectsCard).toBeVisible()
    await expect(catalogPage.programsCard).toBeVisible()
  })

  test('should display catalog statistics', async ({ authenticatedPage }) => {
    const catalogPage = new CatalogPage(authenticatedPage)
    await catalogPage.goto()

    await expect(catalogPage.totalEducationLevels).toContainText(/\d+/)
    await expect(catalogPage.totalTracks).toContainText(/\d+/)
    await expect(catalogPage.totalSubjects).toContainText(/\d+/)
    await expect(catalogPage.totalGrades).toContainText(/\d+/)
  })

  test('should navigate to school years management', async ({ authenticatedPage }) => {
    const catalogPage = new CatalogPage(authenticatedPage)
    await catalogPage.goto()

    await catalogPage.clickEducationLevelsLink()

    const yearsPage = new SchoolYearsPage(authenticatedPage)
    await expect(yearsPage.pageHeader).toContainText(/années|years/i)
  })

  test('should create a new school year', async ({ authenticatedPage }) => {
    const yearsPage = new SchoolYearsPage(authenticatedPage)
    await yearsPage.goto()

    await yearsPage.addYearButton.click()
    await yearsPage.fillYearName(generateAcademicYear())
    await yearsPage.selectYearStatus('active')

    await yearsPage.submitYearCreation()

    await expect(yearsPage.yearCard.first()).toBeVisible()
  })

  test('should add terms to school year', async ({ authenticatedPage }) => {
    const yearsPage = new SchoolYearsPage(authenticatedPage)
    await yearsPage.goto()

    await yearsPage.expandFirstYear()
    await yearsPage.addTermButton.click()
    await yearsPage.fillTermName('1er Trimestre')
    await yearsPage.selectTermType('trimester')
    await yearsPage.fillTermOrder('1')

    await yearsPage.submitTermCreation()

    await expect(yearsPage.termItem.first()).toContainText(/trimestre|1er/i)
  })

  test('should delete school year with confirmation', async ({ authenticatedPage }) => {
    const yearsPage = new SchoolYearsPage(authenticatedPage)
    await yearsPage.goto()

    await yearsPage.clickFirstYearDelete()

    await expect(yearsPage.deleteConfirmDialog).toBeVisible()
    await yearsPage.confirmDelete()

    await expect(yearsPage.page.getByText(/supprimé|deleted/i)).toBeVisible()
  })

  test('should display grades management page', async ({ authenticatedPage }) => {
    const gradesPage = new GradesPage(authenticatedPage)
    await gradesPage.goto()

    await expect(gradesPage.pageHeader).toContainText(/classes|grades/i)
    await expect(gradesPage.addGradeButton).toBeVisible()
  })

  test('should create a new grade level', async ({ authenticatedPage }) => {
    const gradesPage = new GradesPage(authenticatedPage)
    await gradesPage.goto()

    await gradesPage.addGradeButton.click()
    await gradesPage.fillGradeName('6ème Année')
    await gradesPage.fillGradeCode('GRADE6')
    await gradesPage.selectGradeLevel('primary')

    await gradesPage.submit()

    await expect(gradesPage.gradeCard.first()).toContainText(/6ème/i)
  })

  test('should display subjects management page', async ({ authenticatedPage }) => {
    const subjectsPage = new SubjectsPage(authenticatedPage)
    await subjectsPage.goto()

    await expect(subjectsPage.pageHeader).toContainText(/matières|subjects/i)
    await expect(subjectsPage.addSubjectButton).toBeVisible()
  })

  test('should create a new subject', async ({ authenticatedPage }) => {
    const subjectsPage = new SubjectsPage(authenticatedPage)
    await subjectsPage.goto()

    await subjectsPage.addSubjectButton.click()
    await subjectsPage.fillSubjectName('Philosophie')
    await subjectsPage.selectSubjectCategory('humanities')

    await subjectsPage.submit()

    await expect(subjectsPage.subjectCard.first()).toContainText(/philosophie/i)
  })

  test('should filter subjects by category', async ({ authenticatedPage }) => {
    const subjectsPage = new SubjectsPage(authenticatedPage)
    await subjectsPage.goto()

    await subjectsPage.categoryFilter.selectOption('science')

    await expect(subjectsPage.subjectCard.first()).toBeVisible()
  })

  test('should display programs management page', async ({ authenticatedPage }) => {
    const programsPage = new ProgramsPage(authenticatedPage)
    await programsPage.goto()

    await expect(programsPage.pageHeader).toContainText(/programmes|programs/i)
    await expect(programsPage.addProgramButton).toBeVisible()
  })

  test('should create a new program template', async ({ authenticatedPage }) => {
    const programsPage = new ProgramsPage(authenticatedPage)
    await programsPage.goto()

    await programsPage.addProgramButton.click()
    await programsPage.fillProgramName('Mathématiques Terminale C')
    await programsPage.selectSchoolYear('2025-2026')
    await programsPage.selectGrade('Terminale C')
    await programsPage.selectSubject('Mathématiques')

    await programsPage.submit()

    await expect(programsPage.programCard.first()).toContainText(/mathématiques/i)
  })

  test('should display coefficients management page', async ({ authenticatedPage }) => {
    const coefficientsPage = new CoefficientsPage(authenticatedPage)
    await coefficientsPage.goto()

    await expect(coefficientsPage.pageHeader).toContainText(/coefficients|weights/i)
    await expect(coefficientsPage.addCoefficientButton).toBeVisible()
  })

  test('should create coefficient template', async ({ authenticatedPage }) => {
    const coefficientsPage = new CoefficientsPage(authenticatedPage)
    await coefficientsPage.goto()

    await coefficientsPage.addCoefficientButton.click()
    await coefficientsPage.selectSchoolYear('2025-2026')
    await coefficientsPage.selectGrade('Terminale C')
    await coefficientsPage.selectSubject('Mathématiques')
    await coefficientsPage.fillWeight('4')

    await coefficientsPage.submit()

    await expect(coefficientsPage.coefficientRow.first()).toContainText(/4/)
  })

  test('should bulk update coefficients', async ({ authenticatedPage }) => {
    const coefficientsPage = new CoefficientsPage(authenticatedPage)
    await coefficientsPage.goto()

    await coefficientsPage.bulkEditButton.click()

    await expect(coefficientsPage.bulkEditModal).toBeVisible()
    await coefficientsPage.fillBulkWeight('3')
    await coefficientsPage.applyBulkUpdate()

    await expect(coefficientsPage.successToast).toBeVisible()
  })

  test('should copy coefficients from previous year', async ({ authenticatedPage }) => {
    const coefficientsPage = new CoefficientsPage(authenticatedPage)
    await coefficientsPage.goto()

    await coefficientsPage.copyFromPreviousYearButton.click()

    await expect(coefficientsPage.copyYearModal).toBeVisible()
    await coefficientsPage.selectSourceYear('2024-2025')
    await coefficientsPage.confirmCopy()

    await expect(coefficientsPage.successToast).toBeVisible()
  })
})

test.describe('Authorization & Permissions', () => {
  test('should allow access to dashboard for authenticated users', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')
    await expect(authenticatedPage).toHaveURL(/\/dashboard/)
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login|login/)
  })

  test('should allow access to schools management', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/schools')
    await expect(authenticatedPage).toHaveURL(/\/schools/)
  })

  test('should allow access to catalogs management', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/catalogs')
    await expect(authenticatedPage).toHaveURL(/\/catalogs/)
  })

  test('should allow access to analytics', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/analytics')
    await expect(authenticatedPage).toHaveURL(/\/analytics/)
  })

  test('should display sidebar navigation for authenticated users', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')

    const sidebar = authenticatedPage.locator('[class*="sidebar"]')
    await expect(sidebar).toBeVisible()

    await expect(sidebar.getByText(/tableau de bord|dashboard/i)).toBeVisible()
    await expect(sidebar.getByText(/écoles|schools/i)).toBeVisible()
    await expect(sidebar.getByText(/catalogues|catalogs/i)).toBeVisible()
  })

  test('should display user menu with logout option', async ({ authenticatedPage }) => {
    const authPage = new AuthPage(authenticatedPage)
    await authPage.userMenu.click()

    await expect(authPage.logoutButton).toBeVisible()
  })

  test('should display notifications bell', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')

    const notifications = authenticatedPage.locator('[class*="notification"]')
    await expect(notifications).toBeVisible()
  })
})

test.describe('Complete Workflows', () => {
  test('should complete full school creation workflow', async ({ authenticatedPage }) => {
    const createPage = new SchoolCreatePage(authenticatedPage)
    await createPage.goto()

    const schoolName = generateUniqueSchoolName('Complete Workflow School')
    const schoolCode = generateUniqueSchoolCode()

    await createPage.fillSchoolName(schoolName)
    await createPage.fillSchoolCode(schoolCode)
    await createPage.fillAddress('456 Avenue Principale, Yamoussoukro')
    await createPage.fillPhone(generateIvorianPhone())
    await createPage.fillEmail(`admin@${schoolCode.toLowerCase()}.ci`)
    await createPage.selectStatus('active')

    await createPage.submit()

    await expect(authenticatedPage).toHaveURL(/\/schools/)
    await expect(authenticatedPage.getByText(schoolName)).toBeVisible()

    const schoolPage = new SchoolManagementPage(authenticatedPage)
    await expect(schoolPage.firstSchoolRow).toContainText(/active/i)
  })

  test('should complete full catalog setup workflow', async ({ authenticatedPage }) => {
    const yearsPage = new SchoolYearsPage(authenticatedPage)
    await yearsPage.goto()

    await yearsPage.addYearButton.click()
    await yearsPage.fillYearName(generateAcademicYear())
    await yearsPage.selectYearStatus('active')
    await yearsPage.submitYearCreation()

    await yearsPage.expandFirstYear()
    await yearsPage.addTermButton.click()
    await yearsPage.fillTermName('1er Trimestre')
    await yearsPage.selectTermType('trimester')
    await yearsPage.fillTermOrder('1')
    await yearsPage.submitTermCreation()

    await yearsPage.addTermButton.click()
    await yearsPage.fillTermName('2ème Trimestre')
    await yearsPage.selectTermType('trimester')
    await yearsPage.fillTermOrder('2')
    await yearsPage.submitTermCreation()

    await expect(yearsPage.termItem.first()).toBeVisible()
    await expect(yearsPage.termItem.nth(1)).toBeVisible()
  })

  test('should complete school to analytics workflow', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage)
    await dashboardPage.goto()

    await dashboardPage.clickQuickAction('Voir les analytiques')

    const analyticsPage = new AnalyticsPage(authenticatedPage)
    await expect(analyticsPage.pageHeader).toContainText(/analytiques/i)

    await analyticsPage.timeRangeSelect.selectOption('30d')

    await analyticsPage.exportExcelButton.click()
    await expect(analyticsPage.successToast).toContainText(/export|téléchargé/i)
  })

  test('should navigate through all main sections', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')
    await expect(authenticatedPage).toHaveURL(/\/dashboard/)

    await authenticatedPage.goto('/schools')
    await expect(authenticatedPage).toHaveURL(/\/schools/)

    await authenticatedPage.goto('/catalogs')
    await expect(authenticatedPage).toHaveURL(/\/catalogs/)

    await authenticatedPage.goto('/analytics')
    await expect(authenticatedPage).toHaveURL(/\/analytics/)

    await authenticatedPage.goto('/settings')
    await expect(authenticatedPage).toHaveURL(/\/settings/)
  })

  test('should handle error recovery in form submissions', async ({ authenticatedPage }) => {
    const createPage = new SchoolCreatePage(authenticatedPage)
    await createPage.goto()

    await createPage.fillSchoolCode('ERROR-TEST-CODE')
    await createPage.submit()

    await expect(createPage.nameError).toBeVisible()

    await createPage.fillSchoolName('Recovery Test School')

    await expect(createPage.submitButton).toBeEnabled()
  })

  test('should handle bulk import workflow', async ({ authenticatedPage }) => {
    const schoolPage = new SchoolManagementPage(authenticatedPage)
    await schoolPage.goto()

    await schoolPage.importButton.click()
    await schoolPage.uploadImportFile('multiple-schools.xlsx')

    await expect(schoolPage.importSuccessToast).toContainText(/5|plusieurs|importé/i)
  })
})
