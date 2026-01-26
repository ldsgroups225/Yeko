import type { Locator, Page } from '@playwright/test'

export class AuthPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly googleSignInButton: Locator
  readonly userMenu: Locator
  readonly logoutButton: Locator
  readonly forgotPasswordLink: Locator
  readonly resetEmailInput: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i))
    this.passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i))
    this.loginButton = page.getByRole('button', { name: /sign in|se connecter/i })
    this.googleSignInButton = page.getByRole('button', { name: /google/i })
    this.userMenu = page.getByRole('button', { name: /menu|profile|utilisateur/i })
    this.logoutButton = page.getByRole('button', { name: /logout|déconnexion/i })
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot|mot de passe|password/i })
    this.resetEmailInput = page.getByLabel(/email/i)
    this.errorMessage = page.getByText(/invalid|incorrect|error|échec/i)
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }

  async loginWithGoogle() {
    await this.googleSignInButton.click()
  }

  async logout() {
    await this.userMenu.click()
    await this.logoutButton.click()
  }
}

export class DashboardPage {
  readonly page: Page
  readonly pageHeader: Locator
  readonly statsCards: Locator
  readonly totalSchoolsCard: Locator
  readonly activeSchoolsCard: Locator
  readonly recentSchoolsSection: Locator
  readonly systemHealthSection: Locator
  readonly databaseStatus: Locator
  readonly apiStatus: Locator
  readonly activityFeed: Locator

  constructor(page: Page) {
    this.page = page
    this.pageHeader = page.getByRole('heading', { name: /tableau de bord|dashboard/i })
    this.statsCards = page.locator('[class*="stats-card"], [class*="StatCard"]')
    this.totalSchoolsCard = page.getByText(/total.*écoles|total schools/i).locator('..')
    this.activeSchoolsCard = page.getByText(/écoles actives|active schools/i).locator('..')
    this.recentSchoolsSection = page.getByRole('heading', { name: /écoles récentes|recent schools/i }).locator('..')
    this.systemHealthSection = page.getByRole('heading', { name: /santé du système|system health/i }).locator('..')
    this.databaseStatus = page.getByText(/base de données|database/i).locator('..')
    this.apiStatus = page.getByText(/api/i).locator('..')
    this.activityFeed = page.getByRole('heading', { name: /flux d'activité|activity feed|recent activity/i }).locator('..')
  }

  async goto() {
    await this.page.goto('/app/dashboard')
    await this.page.waitForLoadState('networkidle')
  }

  async clickQuickAction(actionName: string) {
    const actionCard = this.page.getByRole('heading', { name: actionName }).locator('..')
    await actionCard.click()
  }
}

export class SchoolManagementPage {
  readonly page: Page
  readonly pageHeader: Locator
  readonly addSchoolButton: Locator
  readonly searchInput: Locator
  readonly statusFilter: Locator
  readonly firstSchoolRow: Locator
  readonly exportButton: Locator
  readonly importButton: Locator
  readonly statusBadge: Locator
  readonly confirmDeleteDialog: Locator
  readonly confirmDeleteButton: Locator
  readonly importSuccessToast: Locator

  constructor(page: Page) {
    this.page = page
    this.pageHeader = page.getByRole('heading', { name: /écoles|schools/i })
    this.addSchoolButton = page.getByRole('button', { name: /ajouter.*école|new school|ajouter/i })
    this.searchInput = page.getByPlaceholder(/rechercher.*écoles|search schools/i)
    this.statusFilter = page.getByLabel(/statut|status/i)
    this.firstSchoolRow = page.locator('[class*="school"], [class*="School"]').first()
    this.exportButton = page.getByRole('button', { name: /exporter|export/i })
    this.importButton = page.getByRole('button', { name: /importer|import/i })
    this.statusBadge = page.locator('[class*="badge"], [class*="status"]').first()
    this.confirmDeleteDialog = page.getByRole('dialog', { name: /supprimer|confirmer/i })
    this.confirmDeleteButton = page.getByRole('button', { name: /supprimer|confirmer|delete/i })
    this.importSuccessToast = page.getByText(/import.*succès|import.*success|importé/i).first()
  }

  async goto() {
    await this.page.goto('/app/schools')
    await this.page.waitForLoadState('networkidle')
  }

  async clickFirstSchoolEdit() {
    const editButton = this.page.getByRole('button', { name: /modifier|éditer|edit/i }).first()
    await editButton.click()
  }

  async clickFirstSchoolMenu() {
    const menuButton = this.page.getByRole('button', { name: /menu|more|options/i }).first()
    await menuButton.click()
  }

  async clickStatusOption(status: string) {
    const option = this.page.getByRole('menuitem', { name: new RegExp(status, 'i') })
    await option.click()
  }

  async clickDeleteOption() {
    const deleteOption = this.page.getByRole('menuitem', { name: /supprimer|delete/i })
    await deleteOption.click()
  }

  async confirmDeleteByTyping(confirmText: string) {
    const confirmInput = this.page.getByRole('textbox', { name: new RegExp(confirmText, 'i') })
    await confirmInput.fill(confirmText)
  }

  async uploadImportFile(fileName: string) {
    const fileInput = this.page.locator('input[type="file"]')
    await fileInput.setInputFiles(fileName)
  }
}

export class SchoolCreatePage {
  readonly page: Page
  readonly pageHeader: Locator
  readonly nameInput: Locator
  readonly codeInput: Locator
  readonly addressInput: Locator
  readonly phoneInput: Locator
  readonly emailInput: Locator
  readonly statusSelect: Locator
  readonly logoInput: Locator
  readonly logoPreview: Locator
  readonly submitButton: Locator
  readonly nameError: Locator
  readonly codeError: Locator

  constructor(page: Page) {
    this.page = page
    this.pageHeader = page.getByRole('heading', { name: /créer.*école|create school/i })
    this.nameInput = page.getByLabel(/nom.*école|school name/i)
    this.codeInput = page.getByLabel(/code.*école|school code/i)
    this.addressInput = page.getByLabel(/adresse|address/i)
    this.phoneInput = page.getByLabel(/téléphone|phone/i)
    this.emailInput = page.getByLabel(/email|courriel/i)
    this.statusSelect = page.getByLabel(/statut|status/i)
    this.logoInput = page.getByLabel(/logo/i)
    this.logoPreview = page.locator('[class*="logo-preview"], img[alt*="logo"]')
    this.submitButton = page.getByRole('button', { name: /créer|enregistrer|create|save/i })
    this.nameError = page.getByText(/nom.*obligatoire|name.*required/i)
    this.codeError = page.getByText(/code.*obligatoire|code.*required/i)
  }

  async goto() {
    await this.page.goto('/app/schools/create')
    await this.page.waitForLoadState('networkidle')
  }

  async fillSchoolName(name: string) {
    await this.nameInput.fill(name)
  }

  async fillSchoolCode(code: string) {
    await this.codeInput.fill(code)
  }

  async fillAddress(address: string) {
    await this.addressInput.fill(address)
  }

  async fillPhone(phone: string) {
    await this.phoneInput.fill(phone)
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email)
  }

  async selectStatus(status: 'active' | 'inactive' | 'suspended') {
    await this.statusSelect.selectOption(status)
  }

  async uploadLogo(fileName: string) {
    const fileInput = this.page.locator('input[type="file"]')
    await fileInput.setInputFiles(fileName)
  }

  async submit() {
    await this.submitButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async clearSchoolName() {
    await this.nameInput.clear()
  }

  async fillSchoolNameInput(name: string) {
    await this.nameInput.fill(name)
  }
}

export class SchoolEditPage {
  readonly page: Page
  readonly pageHeader: Locator
  readonly nameInput: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.pageHeader = page.getByRole('heading', { name: /modifier|éditer|edit/i })
    this.nameInput = page.getByLabel(/nom.*école|school name/i)
    this.submitButton = page.getByRole('button', { name: /enregistrer|modifier|save|update/i })
  }

  async clearSchoolName() {
    await this.nameInput.clear()
  }

  async fillSchoolName(name: string) {
    await this.nameInput.fill(name)
  }

  async submit() {
    await this.submitButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class CatalogPage {
  readonly page: Page
  readonly pageHeader: Locator
  readonly educationLevelsCard: Locator
  readonly gradesCard: Locator
  readonly subjectsCard: Locator
  readonly programsCard: Locator
  readonly totalEducationLevels: Locator
  readonly totalTracks: Locator
  readonly totalSubjects: Locator
  readonly totalGrades: Locator

  constructor(page: Page) {
    this.page = page
    this.pageHeader = page.getByRole('heading', { name: /catalogues|catalogs/i })
    this.educationLevelsCard = page.getByRole('heading', { name: /niveaux.*éducation|education levels/i }).locator('..')
    this.gradesCard = page.getByRole('heading', { name: /classes|grades/i }).locator('..')
    this.subjectsCard = page.getByRole('heading', { name: /matières|subjects/i }).locator('..')
    this.programsCard = page.getByRole('heading', { name: /programmes|programs/i }).locator('..')
    this.totalEducationLevels = page.getByText(/niveaux.*éducation/i).locator('..').locator('[class*="font-bold"]')
    this.totalTracks = page.getByText(/filières/i).locator('..').locator('[class*="font-bold"]')
    this.totalSubjects = page.getByText(/matières/i).locator('..').locator('[class*="font-bold"]')
    this.totalGrades = page.getByText(/classes/i).locator('..').locator('[class*="font-bold"]')
  }

  async goto() {
    await this.page.goto('/app/catalogs')
    await this.page.waitForLoadState('networkidle')
  }

  async clickEducationLevelsLink() {
    await this.educationLevelsCard.click()
  }
}

export class SchoolYearsPage {
  readonly page: Page
  readonly pageHeader: Locator
  readonly addYearButton: Locator
  readonly yearInput: Locator
  readonly yearStatusSelect: Locator
  readonly addTermButton: Locator
  readonly termInput: Locator
  readonly termTypeSelect: Locator
  readonly termOrderInput: Locator
  readonly yearCard: Locator
  readonly termItem: Locator
  readonly deleteConfirmDialog: Locator
  readonly successToast: Locator

  constructor(page: Page) {
    this.page = page
    this.pageHeader = page.getByRole('heading', { name: /années.*scolaires|school years/i })
    this.addYearButton = page.getByRole('button', { name: /nouvelle.*année|new year/i })
    this.yearInput = page.getByLabel(/nom.*année|year name/i)
    this.yearStatusSelect = page.getByLabel(/statut|status/i)
    this.addTermButton = page.getByRole('button', { name: /ajouter.*période|add term/i })
    this.termInput = page.getByLabel(/nom.*période|term name/i)
    this.termTypeSelect = page.getByLabel(/type/i)
    this.termOrderInput = page.getByLabel(/ordre|order/i)
    this.yearCard = page.locator('[class*="year-card"], [class*="YearCard"]')
    this.termItem = page.locator('[class*="term-item"], [class*="TermItem"]')
    this.deleteConfirmDialog = page.getByRole('dialog', { name: /supprimer|delete/i })
    this.successToast = page.getByText(/succès|success|créé/i).first()
  }

  async goto() {
    await this.page.goto('/app/catalogs/school-years')
    await this.page.waitForLoadState('networkidle')
  }

  async fillYearName(name: string) {
    await this.yearInput.fill(name)
  }

  async selectYearStatus(status: 'active' | 'inactive') {
    await this.yearStatusSelect.selectOption(status)
  }

  async submitYearCreation() {
    const submitButton = this.page.getByRole('button', { name: /créer|create|enregistrer/i })
    await submitButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async expandFirstYear() {
    const expandButton = this.page.locator('[class*="expand"], [class*="chevron"]').first()
    await expandButton.click()
  }

  async fillTermName(name: string) {
    await this.termInput.fill(name)
  }

  async selectTermType(type: 'trimester' | 'semester') {
    await this.termTypeSelect.selectOption(type)
  }

  async fillTermOrder(order: string) {
    await this.termOrderInput.fill(order)
  }

  async submitTermCreation() {
    const submitButton = this.page.getByRole('button', { name: /ajouter|add|create/i }).last()
    await submitButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async clickFirstYearDelete() {
    const deleteButton = this.page.getByRole('button', { name: /supprimer|delete/i }).first()
    await deleteButton.click()
  }

  async confirmDelete() {
    const confirmButton = this.page.getByRole('button', { name: /supprimer|confirmer|delete/i })
    await confirmButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class GradesPage {
  readonly page: Page
  readonly pageHeader: Locator
  readonly addGradeButton: Locator
  readonly gradeNameInput: Locator
  readonly gradeCodeInput: Locator
  readonly gradeLevelSelect: Locator
  readonly submitButton: Locator
  readonly gradeCard: Locator

  constructor(page: Page) {
    this.page = page
    this.pageHeader = page.getByRole('heading', { name: /classes|grades/i })
    this.addGradeButton = page.getByRole('button', { name: /ajouter.*classe|new grade/i })
    this.gradeNameInput = page.getByLabel(/nom.*classe|grade name/i)
    this.gradeCodeInput = page.getByLabel(/code/i)
    this.gradeLevelSelect = page.getByLabel(/niveau|level/i)
    this.submitButton = page.getByRole('button', { name: /créer|enregistrer|create|save/i })
    this.gradeCard = page.locator('[class*="grade-card"], [class*="GradeCard"]')
  }

  async goto() {
    await this.page.goto('/app/catalogs/grades')
    await this.page.waitForLoadState('networkidle')
  }

  async fillGradeName(name: string) {
    await this.gradeNameInput.fill(name)
  }

  async fillGradeCode(code: string) {
    await this.gradeCodeInput.fill(code)
  }

  async selectGradeLevel(level: string) {
    await this.gradeLevelSelect.selectOption(level)
  }

  async submit() {
    await this.submitButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class SubjectsPage {
  readonly page: Page
  readonly pageHeader: Locator
  readonly addSubjectButton: Locator
  readonly subjectNameInput: Locator
  readonly subjectCategorySelect: Locator
  readonly submitButton: Locator
  readonly subjectCard: Locator
  readonly categoryFilter: Locator

  constructor(page: Page) {
    this.page = page
    this.pageHeader = page.getByRole('heading', { name: /matières|subjects/i })
    this.addSubjectButton = page.getByRole('button', { name: /ajouter.*matière|new subject/i })
    this.subjectNameInput = page.getByLabel(/nom.*matière|subject name/i)
    this.subjectCategorySelect = page.getByLabel(/catégorie|category/i)
    this.submitButton = page.getByRole('button', { name: /créer|enregistrer|create|save/i })
    this.subjectCard = page.locator('[class*="subject-card"], [class*="SubjectCard"]')
    this.categoryFilter = page.getByLabel(/catégorie|category/i)
  }

  async goto() {
    await this.page.goto('/app/catalogs/subjects')
    await this.page.waitForLoadState('networkidle')
  }

  async fillSubjectName(name: string) {
    await this.subjectNameInput.fill(name)
  }

  async selectSubjectCategory(category: string) {
    await this.subjectCategorySelect.selectOption(category)
  }

  async submit() {
    await this.submitButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class ProgramsPage {
  readonly page: Page
  readonly pageHeader: Locator
  readonly addProgramButton: Locator
  readonly programNameInput: Locator
  readonly schoolYearSelect: Locator
  readonly gradeSelect: Locator
  readonly subjectSelect: Locator
  readonly submitButton: Locator
  readonly programCard: Locator

  constructor(page: Page) {
    this.page = page
    this.pageHeader = page.getByRole('heading', { name: /programmes|programs/i })
    this.addProgramButton = page.getByRole('button', { name: /ajouter.*programme|new program/i })
    this.programNameInput = page.getByLabel(/nom.*programme|program name/i)
    this.schoolYearSelect = page.getByLabel(/année.*scolaire|school year/i)
    this.gradeSelect = page.getByLabel(/classe|grade/i)
    this.subjectSelect = page.getByLabel(/matière|subject/i)
    this.submitButton = page.getByRole('button', { name: /créer|enregistrer|create|save/i })
    this.programCard = page.locator('[class*="program-card"], [class*="ProgramCard"]')
  }

  async goto() {
    await this.page.goto('/app/catalogs/programs')
    await this.page.waitForLoadState('networkidle')
  }

  async fillProgramName(name: string) {
    await this.programNameInput.fill(name)
  }

  async selectSchoolYear(year: string) {
    await this.schoolYearSelect.selectOption(year)
  }

  async selectGrade(grade: string) {
    await this.gradeSelect.selectOption(grade)
  }

  async selectSubject(subject: string) {
    await this.subjectSelect.selectOption(subject)
  }

  async submit() {
    await this.submitButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class CoefficientsPage {
  readonly page: Page
  readonly pageHeader: Locator
  readonly addCoefficientButton: Locator
  readonly schoolYearSelect: Locator
  readonly gradeSelect: Locator
  readonly subjectSelect: Locator
  readonly weightInput: Locator
  readonly submitButton: Locator
  readonly coefficientRow: Locator
  readonly bulkEditButton: Locator
  readonly bulkEditModal: Locator
  readonly copyFromPreviousYearButton: Locator
  readonly copyYearModal: Locator
  readonly successToast: Locator

  constructor(page: Page) {
    this.page = page
    this.pageHeader = page.getByRole('heading', { name: /coefficients|weights/i })
    this.addCoefficientButton = page.getByRole('button', { name: /ajouter.*coefficient|new coefficient/i })
    this.schoolYearSelect = page.getByLabel(/année.*scolaire|school year/i)
    this.gradeSelect = page.getByLabel(/classe|grade/i)
    this.subjectSelect = page.getByLabel(/matière|subject/i)
    this.weightInput = page.getByLabel(/coefficient|poids|weight/i)
    this.submitButton = page.getByRole('button', { name: /créer|enregistrer|create|save/i })
    this.coefficientRow = page.locator('[class*="coefficient-row"], [class*="CoefficientRow"]')
    this.bulkEditButton = page.getByRole('button', { name: /édition.*mas|bulk edit/i })
    this.bulkEditModal = page.getByRole('dialog', { name: /édition.*mas|bulk edit/i })
    this.copyFromPreviousYearButton = page.getByRole('button', { name: /copier.*année|copy.*year/i })
    this.copyYearModal = page.getByRole('dialog', { name: /copier.*année|copy year/i })
    this.successToast = page.getByText(/succès|success|exporté/i).first()
  }

  async goto() {
    await this.page.goto('/app/catalogs/coefficients')
    await this.page.waitForLoadState('networkidle')
  }

  async selectSchoolYear(year: string) {
    await this.schoolYearSelect.selectOption(year)
  }

  async selectGrade(grade: string) {
    await this.gradeSelect.selectOption(grade)
  }

  async selectSubject(subject: string) {
    await this.subjectSelect.selectOption(subject)
  }

  async fillWeight(weight: string) {
    await this.weightInput.fill(weight)
  }

  async submit() {
    await this.submitButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async fillBulkWeight(weight: string) {
    const weightInputs = this.bulkEditModal.locator('[type="number"]')
    await weightInputs.first().fill(weight)
  }

  async applyBulkUpdate() {
    const applyButton = this.bulkEditModal.getByRole('button', { name: /appliquer|apply|save/i })
    await applyButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async selectSourceYear(year: string) {
    const yearSelect = this.copyYearModal.getByRole('combobox')
    await yearSelect.selectOption(year)
  }

  async confirmCopy() {
    const copyButton = this.copyYearModal.getByRole('button', { name: /copier|copy/i })
    await copyButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class AnalyticsPage {
  readonly page: Page
  readonly pageHeader: Locator
  readonly overviewTab: Locator
  readonly schoolsPerformanceTab: Locator
  readonly usageTab: Locator
  readonly timeRangeSelect: Locator
  readonly totalSchoolsMetric: Locator
  readonly activeUsersMetric: Locator
  readonly exportExcelButton: Locator
  readonly schoolsByStatusSection: Locator
  readonly dailyActiveUsersSection: Locator
  readonly successToast: Locator

  constructor(page: Page) {
    this.page = page
    this.pageHeader = page.getByRole('heading', { name: /analytiques|analytics/i })
    this.overviewTab = page.getByRole('tab', { name: /vue.*ensemble|overview/i })
    this.schoolsPerformanceTab = page.getByRole('tab', { name: /performance.*écoles|schools.*performance/i })
    this.usageTab = page.getByRole('tab', { name: /utilisation|usage/i })
    this.timeRangeSelect = page.getByLabel(/période|time range/i)
    this.totalSchoolsMetric = page.getByText(/total.*écoles|total schools/i).locator('..').locator('[class*="font-bold"]')
    this.activeUsersMetric = page.getByText(/utilisateurs.*actifs|active users/i).locator('..').locator('[class*="font-bold"]')
    this.exportExcelButton = page.getByRole('button', { name: /excel|export.*excel/i })
    this.schoolsByStatusSection = page.getByRole('heading', { name: /statut.*écoles|schools.*status/i }).locator('..')
    this.dailyActiveUsersSection = page.getByRole('heading', { name: /utilisateurs.*actifs|active users/i }).locator('..')
    this.successToast = page.getByText(/export|téléchargé|succès/i).first()
  }

  async goto() {
    await this.page.goto('/app/analytics')
    await this.page.waitForLoadState('networkidle')
  }
}

export class SettingsPage {
  readonly page: Page
  readonly pageHeader: Locator

  constructor(page: Page) {
    this.page = page
    this.pageHeader = page.getByRole('heading', { name: /paramètres|settings/i })
  }

  async goto() {
    await this.page.goto('/app/settings')
    await this.page.waitForLoadState('networkidle')
  }
}
