import type { Locator, Page } from '@playwright/test'

/**
 * Page Object Models for E2E tests
 * Encapsulates page interactions and selectors
 */

export class RoleManagementPage {
  readonly page: Page
  readonly newRoleButton: Locator
  readonly roleNameInput: Locator
  readonly roleSlugInput: Locator
  readonly roleDescriptionInput: Locator
  readonly roleScopeSelect: Locator
  readonly generateSlugButton: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator
  readonly permissionsMatrix: Locator

  constructor(page: Page) {
    this.page = page
    this.newRoleButton = page.getByRole('button', { name: /new role|nouveau rôle/i })
    this.roleNameInput = page.getByLabel(/role name|nom du rôle/i)
    this.roleSlugInput = page.getByLabel(/slug/i)
    this.roleDescriptionInput = page.getByLabel(/description/i)
    this.roleScopeSelect = page.getByLabel(/scope|portée/i)
    this.generateSlugButton = page.getByRole('button', { name: /generate|générer/i })
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
    this.cancelButton = page.getByRole('button', { name: /cancel|annuler/i })
    this.permissionsMatrix = page.getByRole('table')
  }

  async goto() {
    await this.page.goto('/users/roles/')
    await this.page.waitForLoadState('domcontentloaded')
  }

  async createRole(data: {
    name: string
    slug?: string
    description?: string
    scope?: string
  }) {
    await this.newRoleButton.click()
    await this.roleNameInput.fill(data.name)

    if (data.slug) {
      await this.roleSlugInput.fill(data.slug)
    }
    else {
      await this.generateSlugButton.click()
    }

    if (data.description) {
      await this.roleDescriptionInput.fill(data.description)
    }

    if (data.scope) {
      await this.roleScopeSelect.selectOption(data.scope)
    }
  }

  async setPermission(resource: string, action: string, enabled: boolean) {
    const checkbox = this.page.locator(
      `[data-resource="${resource}"][data-action="${action}"]`,
    )

    if (enabled) {
      await checkbox.check()
    }
    else {
      await checkbox.uncheck()
    }
  }

  async selectAllPermissions() {
    const selectAllButton = this.page.getByRole('button', { name: /select all|tout sélectionner/i })
    await selectAllButton.click()
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async cancel() {
    await this.cancelButton.click()
  }

  async getRoleByName(name: string): Promise<Locator> {
    return this.page.getByRole('row').filter({ hasText: name })
  }

  async editRole(name: string) {
    const row = await this.getRoleByName(name)
    await row.getByRole('button', { name: /edit|modifier/i }).click()
  }

  async deleteRole(name: string) {
    const row = await this.getRoleByName(name)
    await row.getByRole('button', { name: /delete|supprimer/i }).click()

    // Confirm deletion
    const confirmButton = this.page.getByRole('button', { name: /confirm/i })
    await confirmButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class UserManagementPage {
  readonly page: Page
  readonly newUserButton: Locator
  readonly userNameInput: Locator
  readonly userEmailInput: Locator
  readonly userPhoneInput: Locator
  readonly userStatusSelect: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator

  constructor(page: Page) {
    this.page = page
    this.newUserButton = page.getByRole('button', { name: /new user|nouvel utilisateur/i })
    this.userNameInput = page.getByLabel(/name|nom/i)
    this.userEmailInput = page.getByLabel(/email/i)
    this.userPhoneInput = page.getByLabel(/phone|téléphone/i)
    this.userStatusSelect = page.getByLabel(/status|statut/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
    this.cancelButton = page.getByRole('button', { name: /cancel|annuler/i })
  }

  async goto() {
    await this.page.goto('/users/users/')
    await this.page.waitForLoadState('domcontentloaded')
  }

  async createUser(data: {
    name: string
    email: string
    phone?: string
    status?: string
    roles?: string[]
  }) {
    await this.newUserButton.click()
    await this.userNameInput.fill(data.name)
    await this.userEmailInput.fill(data.email)

    if (data.phone) {
      await this.userPhoneInput.fill(data.phone)
    }

    if (data.status) {
      await this.userStatusSelect.selectOption(data.status)
    }

    if (data.roles) {
      for (const role of data.roles) {
        await this.assignRole(role)
      }
    }
  }

  async assignRole(roleName: string) {
    const roleCheckbox = this.page.getByLabel(roleName)
    await roleCheckbox.check()
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async cancel() {
    await this.cancelButton.click()
  }

  async getUserByEmail(email: string): Promise<Locator> {
    return this.page.getByRole('row').filter({ hasText: email })
  }

  async editUser(email: string) {
    const row = await this.getUserByEmail(email)
    await row.getByRole('button', { name: /edit|modifier/i }).click()
  }

  async deleteUser(email: string) {
    const row = await this.getUserByEmail(email)
    await row.getByRole('button', { name: /delete|supprimer/i }).click()

    // Confirm deletion
    const confirmButton = this.page.getByRole('button', { name: /confirm/i })
    await confirmButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class StaffManagementPage {
  readonly page: Page
  readonly newStaffButton: Locator
  readonly userIdSelect: Locator
  readonly positionSelect: Locator
  readonly departmentInput: Locator
  readonly hireDateInput: Locator
  readonly statusSelect: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator

  constructor(page: Page) {
    this.page = page
    this.newStaffButton = page.getByRole('button', { name: /new staff|nouveau personnel/i })
    this.userIdSelect = page.getByLabel(/user|utilisateur/i)
    this.positionSelect = page.getByLabel(/position|poste/i)
    this.departmentInput = page.getByLabel(/department|département/i)
    this.hireDateInput = page.getByLabel(/hire date|date d'embauche/i)
    this.statusSelect = page.getByLabel(/status|statut/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
    this.cancelButton = page.getByRole('button', { name: /cancel|annuler/i })
  }

  async goto() {
    await this.page.goto('/users/staff/')
    await this.page.waitForLoadState('domcontentloaded')
  }

  async createStaff(data: {
    userId: string
    position: string
    department?: string
    hireDate: string
    status?: string
  }) {
    await this.newStaffButton.click()
    await this.userIdSelect.selectOption(data.userId)
    await this.positionSelect.selectOption(data.position)

    if (data.department) {
      await this.departmentInput.fill(data.department)
    }

    await this.hireDateInput.fill(data.hireDate)

    if (data.status) {
      await this.statusSelect.selectOption(data.status)
    }
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async cancel() {
    await this.cancelButton.click()
  }
}

export class TeacherManagementPage {
  readonly page: Page
  readonly newTeacherButton: Locator
  readonly userIdSelect: Locator
  readonly specializationInput: Locator
  readonly hireDateInput: Locator
  readonly statusSelect: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator

  constructor(page: Page) {
    this.page = page
    this.newTeacherButton = page.getByRole('button', { name: /new teacher|nouvel enseignant/i })
    this.userIdSelect = page.getByLabel(/user|utilisateur/i)
    this.specializationInput = page.getByLabel(/specialization|spécialisation/i)
    this.hireDateInput = page.getByLabel(/hire date|date d'embauche/i)
    this.statusSelect = page.getByLabel(/status|statut/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
    this.cancelButton = page.getByRole('button', { name: /cancel|annuler/i })
  }

  async goto() {
    await this.page.goto('/users/teachers/')
    await this.page.waitForLoadState('domcontentloaded')
  }

  async createTeacher(data: {
    userId: string
    specialization?: string
    hireDate: string
    status?: string
    subjects?: string[]
  }) {
    await this.newTeacherButton.click()
    await this.userIdSelect.selectOption(data.userId)

    if (data.specialization) {
      await this.specializationInput.fill(data.specialization)
    }

    await this.hireDateInput.fill(data.hireDate)

    if (data.status) {
      await this.statusSelect.selectOption(data.status)
    }

    if (data.subjects) {
      for (const subject of data.subjects) {
        await this.assignSubject(subject)
      }
    }
  }

  async assignSubject(subjectName: string) {
    const subjectCheckbox = this.page.getByLabel(subjectName)
    await subjectCheckbox.check()
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async cancel() {
    await this.cancelButton.click()
  }
}
