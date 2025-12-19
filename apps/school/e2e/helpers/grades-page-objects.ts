import type { Locator, Page } from '@playwright/test'

/**
 * Page Object Models for Grades E2E tests
 * Encapsulates page interactions and selectors for grade management
 */

export class GradesDashboardPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly newGradeButton: Locator
  readonly pendingValidationsCard: Locator
  readonly classAverageCard: Locator
  readonly passRateCard: Locator
  readonly pendingAlert: Locator
  readonly gradeEntryLink: Locator
  readonly validationsLink: Locator
  readonly statisticsLink: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.getByRole('heading', { name: /notes|grades/i })
    this.newGradeButton = page.getByRole('button', { name: /saisir|enter/i })
    this.pendingValidationsCard = page.getByText(/validations en attente|pending validations/i)
    this.classAverageCard = page.getByText(/moyenne de classe|class average/i)
    this.passRateCard = page.getByText(/taux de réussite|pass rate/i)
    this.pendingAlert = page.locator('[class*="bg-amber"]')
    this.gradeEntryLink = page.getByRole('link', { name: /saisie des notes|grade entry/i })
    this.validationsLink = page.getByRole('link', { name: /validations/i })
    this.statisticsLink = page.getByRole('link', { name: /statistiques|statistics/i })
  }

  async goto() {
    await this.page.goto('/academic/grades')
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToGradeEntry() {
    await this.gradeEntryLink.click()
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToValidations() {
    await this.validationsLink.click()
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToStatistics() {
    await this.statisticsLink.click()
    await this.page.waitForLoadState('networkidle')
  }

  async getPendingCount(): Promise<number> {
    const text = await this.pendingValidationsCard.textContent()
    const match = text?.match(/\d+/)
    return match ? Number.parseInt(match[0], 10) : 0
  }
}

export class GradeEntryPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly classSelect: Locator
  readonly subjectSelect: Locator
  readonly termSelect: Locator
  readonly gradeTypeSelect: Locator
  readonly descriptionInput: Locator
  readonly gradeTable: Locator
  readonly saveButton: Locator
  readonly submitButton: Locator
  readonly backButton: Locator
  readonly autoSaveIndicator: Locator
  readonly bulkEntryButton: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.getByRole('heading', { name: /saisie des notes|grade entry/i })
    this.classSelect = page.getByLabel(/classe|class/i)
    this.subjectSelect = page.getByLabel(/matière|subject/i)
    this.termSelect = page.getByLabel(/trimestre|term/i)
    this.gradeTypeSelect = page.getByRole('combobox').first()
    this.descriptionInput = page.getByLabel(/description/i)
    this.gradeTable = page.getByRole('table')
    this.saveButton = page.getByRole('button', { name: /enregistrer|save/i })
    this.submitButton = page.getByRole('button', { name: /soumettre|submit/i })
    this.backButton = page.getByRole('button', { name: /retour|back/i })
    this.autoSaveIndicator = page.getByText(/sauvegarde|saving|saved/i)
    this.bulkEntryButton = page.getByRole('button', { name: /saisie groupée|bulk entry/i })
  }

  async goto() {
    await this.page.goto('/academic/grades/entry')
    await this.page.waitForLoadState('networkidle')
  }

  async selectClass(className: string) {
    await this.classSelect.click()
    await this.page.getByRole('option', { name: new RegExp(className, 'i') }).click()
  }

  async selectSubject(subjectName: string) {
    await this.subjectSelect.click()
    await this.page.getByRole('option', { name: new RegExp(subjectName, 'i') }).click()
  }

  async selectTerm(termName: string) {
    await this.termSelect.click()
    await this.page.getByRole('option', { name: new RegExp(termName, 'i') }).click()
  }

  async selectGradeType(type: string) {
    await this.gradeTypeSelect.click()
    await this.page.getByRole('option', { name: new RegExp(type, 'i') }).click()
  }

  async enterGrade(studentName: string, value: number) {
    const row = this.page.getByRole('row').filter({ hasText: studentName })
    const input = row.getByRole('textbox')
    await input.fill(value.toString())
    await input.blur()
  }

  async getGradeCell(studentName: string): Promise<Locator> {
    const row = this.page.getByRole('row').filter({ hasText: studentName })
    return row.getByRole('textbox')
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async submit() {
    await this.submitButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async waitForAutoSave() {
    await this.autoSaveIndicator.waitFor({ state: 'visible' })
    await this.page.waitForTimeout(1000) // Wait for save to complete
  }

  async openBulkEntry() {
    await this.bulkEntryButton.click()
  }
}

export class GradeValidationsPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly filterButton: Locator
  readonly validationCards: Locator
  readonly emptyState: Locator
  readonly backButton: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.getByRole('heading', { name: /validation/i })
    this.filterButton = page.getByRole('button', { name: /filtres|filters/i })
    this.validationCards = page.locator('[data-slot="card"]')
    this.emptyState = page.getByText(/aucune validation|no validations/i)
    this.backButton = page.getByRole('button', { name: /retour|back/i })
  }

  async goto() {
    await this.page.goto('/academic/grades/validations')
    await this.page.waitForLoadState('networkidle')
  }

  async getValidationCard(className: string, subjectName: string): Promise<Locator> {
    return this.page.locator('[data-slot="card"]').filter({
      hasText: className,
    }).filter({
      hasText: subjectName,
    })
  }

  async validateGrades(className: string, subjectName: string, comment?: string) {
    const card = await this.getValidationCard(className, subjectName)
    await card.getByRole('button', { name: /valider|validate/i }).click()

    // Handle confirmation dialog
    if (comment) {
      await this.page.getByLabel(/commentaire|comment/i).fill(comment)
    }
    await this.page.getByRole('button', { name: /confirmer|confirm/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async rejectGrades(className: string, subjectName: string, reason: string) {
    const card = await this.getValidationCard(className, subjectName)
    await card.getByRole('button', { name: /rejeter|reject/i }).click()

    // Handle rejection dialog
    await this.page.getByLabel(/motif|reason/i).fill(reason)
    await this.page.getByRole('button', { name: /confirmer|confirm/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async viewDetails(className: string, subjectName: string) {
    const card = await this.getValidationCard(className, subjectName)
    await card.getByRole('button', { name: /détails|details/i }).click()
  }

  async getPendingCount(): Promise<number> {
    const cards = await this.validationCards.count()
    return cards
  }
}

export class GradeStatisticsPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly classSelect: Locator
  readonly termSelect: Locator
  readonly statisticsCard: Locator
  readonly averagesTable: Locator
  readonly backButton: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.getByRole('heading', { name: /statistiques|statistics/i })
    this.classSelect = page.getByLabel(/classe|class/i)
    this.termSelect = page.getByLabel(/trimestre|term/i)
    this.statisticsCard = page.locator('[data-slot="card"]').first()
    this.averagesTable = page.getByRole('table')
    this.backButton = page.getByRole('button', { name: /retour|back/i })
  }

  async goto() {
    await this.page.goto('/academic/grades/statistics')
    await this.page.waitForLoadState('networkidle')
  }

  async selectClass(className: string) {
    await this.classSelect.click()
    await this.page.getByRole('option', { name: new RegExp(className, 'i') }).click()
  }

  async selectTerm(termName: string) {
    await this.termSelect.click()
    await this.page.getByRole('option', { name: new RegExp(termName, 'i') }).click()
  }

  async getStatistic(label: string): Promise<string | null> {
    const stat = this.page.getByText(label).locator('..').getByRole('status')
    return stat.textContent()
  }

  async getPassRate(): Promise<string | null> {
    return this.page.getByText(/\d+%/).textContent()
  }
}
