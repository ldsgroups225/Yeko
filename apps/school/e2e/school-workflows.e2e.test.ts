import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures/auth.fixture'
import { RoleManagementPage, UserManagementPage } from './helpers/page-objects'
import { generateEmail, generateIvorianPhone, generateUniqueData } from './helpers/test-data'

/**
 * Page Object Models for School E2E Tests
 * Encapsulates page interactions and selectors for school module
 */

export class SchoolProfilePage {
  readonly page: Page
  readonly schoolNameInput: Locator
  readonly schoolAddressInput: Locator
  readonly schoolPhoneInput: Locator
  readonly schoolEmailInput: Locator
  readonly schoolWebsiteInput: Locator
  readonly saveButton: Locator
  readonly editButton: Locator

  constructor(page: Page) {
    this.page = page
    this.schoolNameInput = page.getByLabel(/school name|nom de l'école/i)
    this.schoolAddressInput = page.getByLabel(/address|adresse/i)
    this.schoolPhoneInput = page.getByLabel(/phone|téléphone/i)
    this.schoolEmailInput = page.getByLabel(/email/i)
    this.schoolWebsiteInput = page.getByLabel(/website|site web/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
    this.editButton = page.getByRole('button', { name: /edit|modifier/i })
  }

  async goto() {
    await this.page.goto('/school/settings/profile')
    await this.page.waitForLoadState('networkidle')
  }

  async fillProfile(data: {
    name: string
    address?: string
    phone?: string
    email?: string
    website?: string
  }) {
    await this.editButton.click()
    await this.schoolNameInput.fill(data.name)

    if (data.address) {
      await this.schoolAddressInput.fill(data.address)
    }

    if (data.phone) {
      await this.schoolPhoneInput.fill(data.phone)
    }

    if (data.email) {
      await this.schoolEmailInput.fill(data.email)
    }

    if (data.website) {
      await this.schoolWebsiteInput.fill(data.website)
    }
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class AcademicYearPage {
  readonly page: Page
  readonly newYearButton: Locator
  readonly yearNameInput: Locator
  readonly startDateInput: Locator
  readonly endDateInput: Locator
  readonly statusSelect: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator

  constructor(page: Page) {
    this.page = page
    this.newYearButton = page.getByRole('button', { name: /new academic year|nouvel exercice/i })
    this.yearNameInput = page.getByLabel(/year name|nom de l'exercice/i)
    this.startDateInput = page.getByLabel(/start date|date de début/i)
    this.endDateInput = page.getByLabel(/end date|date de fin/i)
    this.statusSelect = page.getByLabel(/status|statut/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
    this.cancelButton = page.getByRole('button', { name: /cancel|annuler/i })
  }

  async goto() {
    await this.page.goto('/school/settings/academic-years')
    await this.page.waitForLoadState('networkidle')
  }

  async createAcademicYear(data: {
    name: string
    startDate: string
    endDate: string
    status?: string
  }) {
    await this.newYearButton.click()
    await this.yearNameInput.fill(data.name)
    await this.startDateInput.fill(data.startDate)
    await this.endDateInput.fill(data.endDate)

    if (data.status) {
      await this.statusSelect.selectOption(data.status)
    }
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async getYearByName(name: string): Promise<Locator> {
    return this.page.getByRole('row').filter({ hasText: name })
  }
}

export class TermPage {
  readonly page: Page
  readonly newTermButton: Locator
  readonly termNameInput: Locator
  readonly academicYearSelect: Locator
  readonly startDateInput: Locator
  readonly endDateInput: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.newTermButton = page.getByRole('button', { name: /new term|nouveau trimestre/i })
    this.termNameInput = page.getByLabel(/term name|nom du trimestre/i)
    this.academicYearSelect = page.getByLabel(/academic year|exercice académique/i)
    this.startDateInput = page.getByLabel(/start date|date de début/i)
    this.endDateInput = page.getByLabel(/end date|date de fin/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
  }

  async goto() {
    await this.page.goto('/school/settings/terms')
    await this.page.waitForLoadState('networkidle')
  }

  async createTerm(data: {
    name: string
    academicYear: string
    startDate: string
    endDate: string
  }) {
    await this.newTermButton.click()
    await this.termNameInput.fill(data.name)
    await this.academicYearSelect.selectOption(data.academicYear)
    await this.startDateInput.fill(data.startDate)
    await this.endDateInput.fill(data.endDate)
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class GradeLevelPage {
  readonly page: Page
  readonly newGradeButton: Locator
  readonly gradeNameInput: Locator
  readonly gradeLevelInput: Locator
  readonly descriptionInput: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.newGradeButton = page.getByRole('button', { name: /new grade level|nouveau niveau/i })
    this.gradeNameInput = page.getByLabel(/grade name|nom du niveau/i)
    this.gradeLevelInput = page.getByLabel(/level|niveau/i)
    this.descriptionInput = page.getByLabel(/description/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
  }

  async goto() {
    await this.page.goto('/school/settings/grade-levels')
    await this.page.waitForLoadState('networkidle')
  }

  async createGradeLevel(data: {
    name: string
    level: string
    description?: string
  }) {
    await this.newGradeButton.click()
    await this.gradeNameInput.fill(data.name)
    await this.gradeLevelInput.fill(data.level)

    if (data.description) {
      await this.descriptionInput.fill(data.description)
    }
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async getGradeByName(name: string): Promise<Locator> {
    return this.page.getByRole('row').filter({ hasText: name })
  }
}

export class ClassroomPage {
  readonly page: Page
  readonly newClassroomButton: Locator
  readonly classroomNameInput: Locator
  readonly capacityInput: Locator
  readonly buildingInput: Locator
  readonly floorInput: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.newClassroomButton = page.getByRole('button', { name: /new classroom|nouvelle salle/i })
    this.classroomNameInput = page.getByLabel(/classroom name|nom de la salle/i)
    this.capacityInput = page.getByLabel(/capacity|capacité/i)
    this.buildingInput = page.getByLabel(/building|bâtiment/i)
    this.floorInput = page.getByLabel(/floor|étage/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
  }

  async goto() {
    await this.page.goto('/school/settings/classrooms')
    await this.page.waitForLoadState('networkidle')
  }

  async createClassroom(data: {
    name: string
    capacity: string
    building?: string
    floor?: string
  }) {
    await this.newClassroomButton.click()
    await this.classroomNameInput.fill(data.name)
    await this.capacityInput.fill(data.capacity)

    if (data.building) {
      await this.buildingInput.fill(data.building)
    }

    if (data.floor) {
      await this.floorInput.fill(data.floor)
    }
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async getClassroomByName(name: string): Promise<Locator> {
    return this.page.getByRole('row').filter({ hasText: name })
  }
}

export class SubjectPage {
  readonly page: Page
  readonly newSubjectButton: Locator
  readonly subjectNameInput: Locator
  readonly subjectCodeInput: Locator
  readonly descriptionInput: Locator
  readonly coefficientInput: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.newSubjectButton = page.getByRole('button', { name: /new subject|nouvelle matière/i })
    this.subjectNameInput = page.getByLabel(/subject name|nom de la matière/i)
    this.subjectCodeInput = page.getByLabel(/code/i)
    this.descriptionInput = page.getByLabel(/description/i)
    this.coefficientInput = page.getByLabel(/coefficient/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
  }

  async goto() {
    await this.page.goto('/school/settings/subjects')
    await this.page.waitForLoadState('networkidle')
  }

  async createSubject(data: {
    name: string
    code?: string
    description?: string
    coefficient?: string
  }) {
    await this.newSubjectButton.click()
    await this.subjectNameInput.fill(data.name)

    if (data.code) {
      await this.subjectCodeInput.fill(data.code)
    }

    if (data.description) {
      await this.descriptionInput.fill(data.description)
    }

    if (data.coefficient) {
      await this.coefficientInput.fill(data.coefficient)
    }
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async getSubjectByName(name: string): Promise<Locator> {
    return this.page.getByRole('row').filter({ hasText: name })
  }
}

export class TeacherManagementPage {
  readonly page: Page
  readonly newTeacherButton: Locator
  readonly userIdSelect: Locator
  readonly specializationInput: Locator
  readonly subjectsSelect: Locator
  readonly hireDateInput: Locator
  readonly statusSelect: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.newTeacherButton = page.getByRole('button', { name: /new teacher|nouvel enseignant/i })
    this.userIdSelect = page.getByLabel(/user|utilisateur/i)
    this.specializationInput = page.getByLabel(/specialization|spécialisation/i)
    this.subjectsSelect = page.getByLabel(/subjects|matières/i)
    this.hireDateInput = page.getByLabel(/hire date|date d'embauche/i)
    this.statusSelect = page.getByLabel(/status|statut/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
  }

  async goto() {
    await this.page.goto('/school/teachers')
    await this.page.waitForLoadState('networkidle')
  }

  async createTeacher(data: {
    userId: string
    specialization?: string
    subjects?: string[]
    hireDate: string
    status?: string
  }) {
    await this.newTeacherButton.click()
    await this.userIdSelect.selectOption(data.userId)

    if (data.specialization) {
      await this.specializationInput.fill(data.specialization)
    }

    if (data.subjects) {
      for (const subject of data.subjects) {
        const checkbox = this.page.getByLabel(subject)
        await checkbox.check()
      }
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

  async getTeacherByName(name: string): Promise<Locator> {
    return this.page.getByRole('row').filter({ hasText: name })
  }
}

export class StudentEnrollmentPage {
  readonly page: Page
  readonly newStudentButton: Locator
  readonly studentNameInput: Locator
  readonly studentEmailInput: Locator
  readonly studentPhoneInput: Locator
  readonly dateOfBirthInput: Locator
  readonly gradeLevelSelect: Locator
  readonly parentNameInput: Locator
  readonly parentEmailInput: Locator
  readonly parentPhoneInput: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.newStudentButton = page.getByRole('button', { name: /new student|nouvel étudiant/i })
    this.studentNameInput = page.getByLabel(/student name|nom de l'étudiant/i)
    this.studentEmailInput = page.getByLabel(/student email|email de l'étudiant/i)
    this.studentPhoneInput = page.getByLabel(/student phone|téléphone de l'étudiant/i)
    this.dateOfBirthInput = page.getByLabel(/date of birth|date de naissance/i)
    this.gradeLevelSelect = page.getByLabel(/grade level|niveau d'études/i)
    this.parentNameInput = page.getByLabel(/parent name|nom du parent/i)
    this.parentEmailInput = page.getByLabel(/parent email|email du parent/i)
    this.parentPhoneInput = page.getByLabel(/parent phone|téléphone du parent/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
  }

  async goto() {
    await this.page.goto('/school/students')
    await this.page.waitForLoadState('networkidle')
  }

  async createStudentWithParent(data: {
    studentName: string
    studentEmail?: string
    studentPhone?: string
    dateOfBirth: string
    gradeLevel: string
    parentName: string
    parentEmail?: string
    parentPhone?: string
  }) {
    await this.newStudentButton.click()
    await this.studentNameInput.fill(data.studentName)

    if (data.studentEmail) {
      await this.studentEmailInput.fill(data.studentEmail)
    }

    if (data.studentPhone) {
      await this.studentPhoneInput.fill(data.studentPhone)
    }

    await this.dateOfBirthInput.fill(data.dateOfBirth)
    await this.gradeLevelSelect.selectOption(data.gradeLevel)
    await this.parentNameInput.fill(data.parentName)

    if (data.parentEmail) {
      await this.parentEmailInput.fill(data.parentEmail)
    }

    if (data.parentPhone) {
      await this.parentPhoneInput.fill(data.parentPhone)
    }
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async getStudentByName(name: string): Promise<Locator> {
    return this.page.getByRole('row').filter({ hasText: name })
  }
}

export class EmergencyContactPage {
  readonly page: Page
  readonly addContactButton: Locator
  readonly contactNameInput: Locator
  readonly relationshipSelect: Locator
  readonly contactPhoneInput: Locator
  readonly isPrimaryCheckbox: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.addContactButton = page.getByRole('button', { name: /add contact|ajouter un contact/i })
    this.contactNameInput = page.getByLabel(/contact name|nom du contact/i)
    this.relationshipSelect = page.getByLabel(/relationship|relation/i)
    this.contactPhoneInput = page.getByLabel(/phone|téléphone/i)
    this.isPrimaryCheckbox = page.getByLabel(/primary contact|contact principal/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
  }

  async goto(studentId: string) {
    await this.page.goto(`/school/students/${studentId}/emergency-contacts`)
    await this.page.waitForLoadState('networkidle')
  }

  async addEmergencyContact(data: {
    name: string
    relationship: string
    phone: string
    isPrimary?: boolean
  }) {
    await this.addContactButton.click()
    await this.contactNameInput.fill(data.name)
    await this.relationshipSelect.selectOption(data.relationship)
    await this.contactPhoneInput.fill(data.phone)

    if (data.isPrimary) {
      await this.isPrimaryCheckbox.check()
    }
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class RoleAssignmentPage {
  readonly page: Page
  readonly userSelect: Locator
  readonly rolesSelect: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.userSelect = page.getByLabel(/user|utilisateur/i)
    this.rolesSelect = page.getByLabel(/roles|rôles/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
  }

  async goto() {
    await this.page.goto('/school/settings/roles')
    await this.page.waitForLoadState('networkidle')
  }

  async assignRoles(userEmail: string, roles: string[]) {
    await this.userSelect.selectOption(userEmail)

    for (const role of roles) {
      const checkbox = this.page.getByLabel(role)
      await checkbox.check()
    }
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class ClassPage {
  readonly page: Page
  readonly newClassButton: Locator
  readonly classNameInput: Locator
  readonly gradeLevelSelect: Locator
  readonly academicYearSelect: Locator
  readonly classroomSelect: Locator
  readonly teacherSelect: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.newClassButton = page.getByRole('button', { name: /new class|nouvelle classe/i })
    this.classNameInput = page.getByLabel(/class name|nom de la classe/i)
    this.gradeLevelSelect = page.getByLabel(/grade level|niveau/i)
    this.academicYearSelect = page.getByLabel(/academic year|exercice/i)
    this.classroomSelect = page.getByLabel(/classroom|salle/i)
    this.teacherSelect = page.getByLabel(/teacher|enseignant/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
  }

  async goto() {
    await this.page.goto('/school/classes')
    await this.page.waitForLoadState('networkidle')
  }

  async createClass(data: {
    name: string
    gradeLevel: string
    academicYear: string
    classroom?: string
    teacher?: string
  }) {
    await this.newClassButton.click()
    await this.classNameInput.fill(data.name)
    await this.gradeLevelSelect.selectOption(data.gradeLevel)
    await this.academicYearSelect.selectOption(data.academicYear)

    if (data.classroom) {
      await this.classroomSelect.selectOption(data.classroom)
    }

    if (data.teacher) {
      await this.teacherSelect.selectOption(data.teacher)
    }
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async getClassByName(name: string): Promise<Locator> {
    return this.page.getByRole('row').filter({ hasText: name })
  }
}

export class StudentClassEnrollmentPage {
  readonly page: Page
  readonly classSelect: Locator
  readonly studentSelect: Locator
  readonly addButton: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.classSelect = page.getByLabel(/class/i)
    this.studentSelect = page.getByLabel(/student|étudiant/i)
    this.addButton = page.getByRole('button', { name: /add|ajouter/i })
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
  }

  async goto() {
    await this.page.goto('/school/classes/enrollments')
    await this.page.waitForLoadState('networkidle')
  }

  async enrollStudentInClass(className: string, studentName: string) {
    await this.classSelect.selectOption(className)
    await this.studentSelect.selectOption(studentName)
    await this.addButton.click()
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class TimetablePage {
  readonly page: Page
  readonly newSlotButton: Locator
  readonly daySelect: Locator
  readonly periodSelect: Locator
  readonly classSelect: Locator
  readonly subjectSelect: Locator
  readonly teacherSelect: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.newSlotButton = page.getByRole('button', { name: /new slot|nouveau créneau/i })
    this.daySelect = page.getByLabel(/day|jour/i)
    this.periodSelect = page.getByLabel(/period|période/i)
    this.classSelect = page.getByLabel(/class/i)
    this.subjectSelect = page.getByLabel(/subject|matière/i)
    this.teacherSelect = page.getByLabel(/teacher|enseignant/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
  }

  async goto() {
    await this.page.goto('/school/timetable')
    await this.page.waitForLoadState('networkidle')
  }

  async createTimetableSlot(data: {
    day: string
    period: string
    class: string
    subject: string
    teacher?: string
  }) {
    await this.newSlotButton.click()
    await this.daySelect.selectOption(data.day)
    await this.periodSelect.selectOption(data.period)
    await this.classSelect.selectOption(data.class)
    await this.subjectSelect.selectOption(data.subject)

    if (data.teacher) {
      await this.teacherSelect.selectOption(data.teacher)
    }
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class AttendancePage {
  readonly page: Page
  readonly classSelect: Locator
  readonly dateInput: Locator
  readonly statusSelects: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.classSelect = page.getByLabel(/class/i)
    this.dateInput = page.getByLabel(/date/i)
    this.statusSelects = page.getByLabel(/status|statut/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
  }

  async goto() {
    await this.page.goto('/school/attendance')
    await this.page.waitForLoadState('networkidle')
  }

  async recordAttendance(className: string, date: string, studentStatuses: Array<{ studentName: string, status: string }>) {
    await this.classSelect.selectOption(className)
    await this.dateInput.fill(date)

    for (const status of studentStatuses) {
      const row = this.page.getByRole('row').filter({ hasText: status.studentName })
      const statusSelect = row.getByLabel(/status|statut/i)
      await statusSelect.selectOption(status.status)
    }
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class GradeEntryPage {
  readonly page: Page
  readonly classSelect: Locator
  readonly subjectSelect: Locator
  readonly termSelect: Locator
  readonly gradeTypeSelect: Locator
  readonly gradeInputs: Locator
  readonly saveButton: Locator
  readonly submitForValidationButton: Locator

  constructor(page: Page) {
    this.page = page
    this.classSelect = page.getByLabel(/class/i)
    this.subjectSelect = page.getByLabel(/subject|matière/i)
    this.termSelect = page.getByLabel(/term|trimestre/i)
    this.gradeTypeSelect = page.getByLabel(/grade type|type de note/i)
    this.gradeInputs = page.getByLabel(/grade|note/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
    this.submitForValidationButton = page.getByRole('button', { name: /submit for validation|soumettre pour validation/i })
  }

  async goto() {
    await this.page.goto('/school/grades')
    await this.page.waitForLoadState('networkidle')
  }

  async enterGrades(data: {
    class: string
    subject: string
    term: string
    gradeType: string
    grades: Array<{ studentName: string, value: number }>
  }) {
    await this.classSelect.selectOption(data.class)
    await this.subjectSelect.selectOption(data.subject)
    await this.termSelect.selectOption(data.term)
    await this.gradeTypeSelect.selectOption(data.gradeType)

    for (const grade of data.grades) {
      const row = this.page.getByRole('row').filter({ hasText: grade.studentName })
      const gradeInput = row.getByLabel(/grade|note/i)
      await gradeInput.fill(grade.value.toString())
    }
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async submitForValidation() {
    await this.submitForValidationButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class FeeStructurePage {
  readonly page: Page
  readonly newFeeButton: Locator
  readonly feeNameInput: Locator
  readonly amountInput: Locator
  readonly gradeLevelSelect: Locator
  readonly academicYearSelect: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.newFeeButton = page.getByRole('button', { name: /new fee|nouveau frais/i })
    this.feeNameInput = page.getByLabel(/fee name|nom des frais/i)
    this.amountInput = page.getByLabel(/amount|montant/i)
    this.gradeLevelSelect = page.getByLabel(/grade level|niveau/i)
    this.academicYearSelect = page.getByLabel(/academic year|exercice/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
  }

  async goto() {
    await this.page.goto('/school/fees/structures')
    await this.page.waitForLoadState('networkidle')
  }

  async createFeeStructure(data: {
    name: string
    amount: string
    gradeLevel?: string
    academicYear?: string
  }) {
    await this.newFeeButton.click()
    await this.feeNameInput.fill(data.name)
    await this.amountInput.fill(data.amount)

    if (data.gradeLevel) {
      await this.gradeLevelSelect.selectOption(data.gradeLevel)
    }

    if (data.academicYear) {
      await this.academicYearSelect.selectOption(data.academicYear)
    }
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class StudentFeeAssignmentPage {
  readonly page: Page
  readonly studentSelect: Locator
  readonly feeStructureSelect: Locator
  readonly paymentPlanSelect: Locator
  readonly assignButton: Locator

  constructor(page: Page) {
    this.page = page
    this.studentSelect = page.getByLabel(/student|étudiant/i)
    this.feeStructureSelect = page.getByLabel(/fee structure|structure de frais/i)
    this.paymentPlanSelect = page.getByLabel(/payment plan|plan de paiement/i)
    this.assignButton = page.getByRole('button', { name: /assign/i })
  }

  async goto() {
    await this.page.goto('/school/fees/assignments')
    await this.page.waitForLoadState('networkidle')
  }

  async assignFeeToStudent(data: {
    student: string
    feeStructure: string
    paymentPlan?: string
  }) {
    await this.studentSelect.selectOption(data.student)
    await this.feeStructureSelect.selectOption(data.feeStructure)

    if (data.paymentPlan) {
      await this.paymentPlanSelect.selectOption(data.paymentPlan)
    }
  }

  async assign() {
    await this.assignButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class PaymentPage {
  readonly page: Page
  readonly newPaymentButton: Locator
  readonly studentSelect: Locator
  readonly feeSelect: Locator
  readonly amountInput: Locator
  readonly paymentMethodSelect: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.newPaymentButton = page.getByRole('button', { name: /new payment|nouveau paiement/i })
    this.studentSelect = page.getByLabel(/student|étudiant/i)
    this.feeSelect = page.getByLabel(/fee|frais/i)
    this.amountInput = page.getByLabel(/amount|montant/i)
    this.paymentMethodSelect = page.getByLabel(/payment method|méthode de paiement/i)
    this.saveButton = page.getByRole('button', { name: /save|enregistrer/i })
  }

  async goto() {
    await this.page.goto('/school/fees/payments')
    await this.page.waitForLoadState('networkidle')
  }

  async processPayment(data: {
    student: string
    fee: string
    amount: string
    paymentMethod: string
  }) {
    await this.newPaymentButton.click()
    await this.studentSelect.selectOption(data.student)
    await this.feeSelect.selectOption(data.fee)
    await this.amountInput.fill(data.amount)
    await this.paymentMethodSelect.selectOption(data.paymentMethod)
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

export class BalanceTrackingPage {
  readonly page: Page
  readonly studentSelect: Locator
  readonly outstandingBalance: Locator
  readonly paymentHistoryLink: Locator

  constructor(page: Page) {
    this.page = page
    this.studentSelect = page.getByLabel(/student|étudiant/i)
    this.outstandingBalance = page.getByText(/outstanding balance|solde impayé/i)
    this.paymentHistoryLink = page.getByRole('link', { name: /payment history|historique des paiements/i })
  }

  async goto() {
    await this.page.goto('/school/fees/balances')
    await this.page.waitForLoadState('networkidle')
  }

  async viewStudentBalance(studentName: string) {
    await this.studentSelect.selectOption(studentName)
  }
}

export class PaymentHistoryPage {
  readonly page: Page
  readonly studentSelect: Locator
  readonly exportButton: Locator
  readonly transactionTable: Locator

  constructor(page: Page) {
    this.page = page
    this.studentSelect = page.getByLabel(/student|étudiant/i)
    this.exportButton = page.getByRole('button', { name: /export/i })
    this.transactionTable = page.getByRole('table')
  }

  async goto() {
    await this.page.goto('/school/fees/history')
    await this.page.waitForLoadState('networkidle')
  }

  async viewStudentHistory(studentName: string) {
    await this.studentSelect.selectOption(studentName)
  }

  async exportHistory() {
    await this.exportButton.click()
    await this.page.waitForLoadState('networkidle')
  }
}

/**
 * E2E Workflow Tests for School Module
 * Comprehensive tests covering school administration, user management, academic, and financial workflows
 */

test.describe('School Administration & Setup', () => {
  test('should create school profile with basic information', async ({ authenticatedPage }) => {
    const schoolProfilePage = new SchoolProfilePage(authenticatedPage)
    await schoolProfilePage.goto()

    const schoolName = generateUniqueData('École Test')
    await schoolProfilePage.fillProfile({
      name: schoolName,
      address: 'Abidjan, Côte d\'Ivoire',
      phone: generateIvorianPhone(),
      email: `contact@${schoolName.toLowerCase().replace(/\s+/g, '')}.ci`,
      website: `https://${schoolName.toLowerCase().replace(/\s+/g, '')}.ci`,
    })
    await schoolProfilePage.save()

    await expect(authenticatedPage.getByText(schoolName)).toBeVisible()
  })

  test('should configure academic year with term setup', async ({ authenticatedPage }) => {
    const academicYearPage = new AcademicYearPage(authenticatedPage)
    await academicYearPage.goto()

    const yearName = generateUniqueData('2024-2025')
    await academicYearPage.createAcademicYear({
      name: yearName,
      startDate: '2024-09-01',
      endDate: '2025-07-15',
      status: 'active',
    })
    await academicYearPage.save()

    await expect(await academicYearPage.getYearByName(yearName)).toBeVisible()

    const termPage = new TermPage(authenticatedPage)
    await termPage.goto()

    await termPage.createTerm({
      name: '1er Trimestre',
      academicYear: yearName,
      startDate: '2024-09-01',
      endDate: '2024-12-15',
    })
    await termPage.save()

    await expect(authenticatedPage.getByText('1er Trimestre')).toBeVisible()
  })

  test('should define grade level structure', async ({ authenticatedPage }) => {
    const gradeLevelPage = new GradeLevelPage(authenticatedPage)
    await gradeLevelPage.goto()

    const gradeLevels = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale']

    for (const gradeNameBase of gradeLevels) {
      const gradeName = generateUniqueData(gradeNameBase)
      await gradeLevelPage.createGradeLevel({
        name: gradeName,
        level: gradeLevels.indexOf(gradeNameBase).toString(),
        description: `Niveau ${gradeNameBase}`,
      })
      await gradeLevelPage.save()
    }

    await expect(authenticatedPage.getByText('6ème')).toBeVisible()
    await expect(authenticatedPage.getByText('Terminale')).toBeVisible()
  })

  test('should create classroom with capacity management', async ({ authenticatedPage }) => {
    const classroomPage = new ClassroomPage(authenticatedPage)
    await classroomPage.goto()

    const classrooms = [
      { name: 'Salle A1', capacity: '30', building: 'Bâtiment A', floor: '1er' },
      { name: 'Salle B2', capacity: '25', building: 'Bâtiment B', floor: '2ème' },
      { name: 'Laboratoire', capacity: '20', building: 'Bâtiment Principal', floor: '3ème' },
    ]

    for (const classroom of classrooms) {
      const uniqueName = generateUniqueData(classroom.name)
      await classroomPage.createClassroom({
        name: uniqueName,
        capacity: classroom.capacity,
        building: classroom.building,
        floor: classroom.floor,
      })
      await classroomPage.save()
    }

    await expect(authenticatedPage.getByText('Salle A1')).toBeVisible()
  })

  test('should create subject catalog with organization', async ({ authenticatedPage }) => {
    const subjectPage = new SubjectPage(authenticatedPage)
    await subjectPage.goto()

    const subjects = [
      { name: 'Mathématiques', code: 'MATH', coefficient: '4' },
      { name: 'Français', code: 'FR', coefficient: '3' },
      { name: 'Physique-Chimie', code: 'PC', coefficient: '4' },
      { name: 'Anglais', code: 'ANG', coefficient: '2' },
      { name: 'SVT', code: 'SVT', coefficient: '3' },
      { name: 'Histoire-Géographie', code: 'HG', coefficient: '2' },
    ]

    for (const subject of subjects) {
      const uniqueName = generateUniqueData(subject.name)
      await subjectPage.createSubject({
        name: uniqueName,
        code: subject.code,
        coefficient: subject.coefficient,
        description: `Matière de ${subject.name}`,
      })
      await subjectPage.save()
    }

    await expect(authenticatedPage.getByText('Mathématiques')).toBeVisible()
  })
})

test.describe('User Management & Roles', () => {
  test('should create teacher account by admin', async ({ authenticatedPage }) => {
    const userPage = new UserManagementPage(authenticatedPage)
    await userPage.goto()

    const teacherName = generateUniqueData('Prof. Kouassi')
    const teacherEmail = generateEmail(teacherName)

    await userPage.createUser({
      name: teacherName,
      email: teacherEmail,
      phone: generateIvorianPhone(),
      status: 'active',
    })
    await userPage.save()

    await expect(await userPage.getUserByEmail(teacherEmail)).toBeVisible()

    const teacherPage = new TeacherManagementPage(authenticatedPage)
    await teacherPage.goto()

    await teacherPage.createTeacher({
      userId: teacherEmail,
      specialization: 'Mathématiques',
      subjects: ['Mathématiques'],
      hireDate: '2024-01-15',
      status: 'active',
    })
    await teacherPage.save()

    await expect(await teacherPage.getTeacherByName(teacherName)).toBeVisible()
  })

  test('should complete teacher profile with subject assignment', async ({ authenticatedPage }) => {
    const teacherPage = new TeacherManagementPage(authenticatedPage)
    await teacherPage.goto()

    await teacherPage.newTeacherButton.click()

    const teacherName = generateUniqueData('Prof. Aïcha')
    await authenticatedPage.getByLabel(/name|nom/i).fill(teacherName)
    await authenticatedPage.getByLabel(/email/i).fill(generateEmail(teacherName))
    await authenticatedPage.getByLabel(/specialization|spécialisation/i).fill('Sciences')

    const mathCheckbox = authenticatedPage.getByLabel('Mathématiques')
    const physicsCheckbox = authenticatedPage.getByLabel('Physique-Chimie')

    if (await mathCheckbox.isVisible()) {
      await mathCheckbox.check()
    }
    if (await physicsCheckbox.isVisible()) {
      await physicsCheckbox.check()
    }

    await authenticatedPage.getByLabel(/hire date|date d'embauche/i).fill('2024-02-01')
    await teacherPage.save()

    await expect(authenticatedPage.getByText(teacherName)).toBeVisible()
  })

  test('should enroll student with parent account creation', async ({ authenticatedPage }) => {
    const studentPage = new StudentEnrollmentPage(authenticatedPage)
    await studentPage.goto()

    const studentName = generateUniqueData('Kouassi Aya')
    const parentName = generateUniqueData('Kouassi Paul')

    await studentPage.createStudentWithParent({
      studentName,
      studentEmail: generateEmail(studentName),
      dateOfBirth: '2010-05-15',
      gradeLevel: '6ème',
      parentName,
      parentEmail: generateEmail(parentName),
      parentPhone: generateIvorianPhone(),
    })
    await studentPage.save()

    await expect(await studentPage.getStudentByName(studentName)).toBeVisible()
  })

  test('should setup student profile with emergency contacts', async ({ authenticatedPage }) => {
    const studentPage = new StudentEnrollmentPage(authenticatedPage)
    await studentPage.goto()

    const studentName = generateUniqueData('Koné Ibrahim')
    await studentPage.createStudentWithParent({
      studentName,
      dateOfBirth: '2010-03-20',
      gradeLevel: '5ème',
      parentName: 'Koné Marie',
    })
    await studentPage.save()

    const emergencyPage = new EmergencyContactPage(authenticatedPage)
    await emergencyPage.goto('student-id')

    await emergencyPage.addEmergencyContact({
      name: 'Koné Paul',
      relationship: 'father',
      phone: generateIvorianPhone(),
      isPrimary: true,
    })
    await emergencyPage.save()

    await expect(authenticatedPage.getByText('Koné Paul')).toBeVisible()
  })

  test('should assign role-based permissions', async ({ authenticatedPage }) => {
    const rolePage = new RoleManagementPage(authenticatedPage)
    await rolePage.goto()

    const roleName = generateUniqueData('Professeur Principal')
    await rolePage.createRole({
      name: roleName,
      description: 'Responsable de classe',
      scope: 'school',
    })
    await rolePage.setPermission('students', 'view', true)
    await rolePage.setPermission('students', 'edit', true)
    await rolePage.setPermission('grades', 'create', true)
    await rolePage.setPermission('grades', 'edit', true)
    await rolePage.save()

    await expect(await rolePage.getRoleByName(roleName)).toBeVisible()
  })
})

test.describe('Academic Management', () => {
  test('should create class and assign teacher', async ({ authenticatedPage }) => {
    const classPage = new ClassPage(authenticatedPage)
    await classPage.goto()

    await classPage.createClass({
      name: generateUniqueData('6ème A'),
      gradeLevel: '6ème',
      academicYear: '2024-2025',
      classroom: 'Salle A1',
      teacher: 'Prof. Kouassi',
    })
    await classPage.save()

    await expect(await classPage.getClassByName('6ème A')).toBeVisible()
  })

  test('should enroll students in specific classes', async ({ authenticatedPage }) => {
    const enrollmentPage = new StudentClassEnrollmentPage(authenticatedPage)
    await enrollmentPage.goto()

    await enrollmentPage.enrollStudentInClass('6ème A', 'Kouassi Aya')
    await enrollmentPage.enrollStudentInClass('6ème A', 'Koné Ibrahim')
    await enrollmentPage.save()

    await expect(authenticatedPage.getByText('Kouassi Aya')).toBeVisible()
    await expect(authenticatedPage.getByText('Koné Ibrahim')).toBeVisible()
  })

  test('should create timetable and scheduling', async ({ authenticatedPage }) => {
    const timetablePage = new TimetablePage(authenticatedPage)
    await timetablePage.goto()

    const slots = [
      { day: 'Monday', period: '08:00-09:00', class: '6ème A', subject: 'Mathématiques' },
      { day: 'Monday', period: '09:00-10:00', class: '6ème A', subject: 'Français' },
      { day: 'Tuesday', period: '08:00-09:00', class: '6ème A', subject: 'Physique-Chimie' },
    ]

    for (const slot of slots) {
      await timetablePage.createTimetableSlot(slot)
      await timetablePage.save()
    }

    await expect(authenticatedPage.getByText('08:00-09:00')).toBeVisible()
  })

  test('should record daily attendance by teacher', async ({ authenticatedPage }) => {
    const attendancePage = new AttendancePage(authenticatedPage)
    await attendancePage.goto()

    await attendancePage.recordAttendance('6ème A', '2024-10-15', [
      { studentName: 'Kouassi Aya', status: 'present' },
      { studentName: 'Koné Ibrahim', status: 'present' },
    ])
    await attendancePage.save()

    await expect(authenticatedPage.getByText(/present|présent/i).first()).toBeVisible()
  })

  test('should enter and validate grades', async ({ authenticatedPage }) => {
    const gradePage = new GradeEntryPage(authenticatedPage)
    await gradePage.goto()

    await gradePage.enterGrades({
      class: '6ème A',
      subject: 'Mathématiques',
      term: '1er Trimestre',
      gradeType: 'Interrogation',
      grades: [
        { studentName: 'Kouassi Aya', value: 15 },
        { studentName: 'Koné Ibrahim', value: 12 },
      ],
    })
    await gradePage.save()

    await gradePage.submitForValidation()

    await expect(authenticatedPage.getByText(/submitted|soumis/i)).toBeVisible()
  })
})

test.describe('Financial Management', () => {
  test('should assign fee structure to students', async ({ authenticatedPage }) => {
    const feeStructurePage = new FeeStructurePage(authenticatedPage)
    await feeStructurePage.goto()

    await feeStructurePage.createFeeStructure({
      name: generateUniqueData('Scolarite 2024-2025'),
      amount: '150000',
      gradeLevel: '6ème',
      academicYear: '2024-2025',
    })
    await feeStructurePage.save()

    await expect(authenticatedPage.getByText('Scolarite 2024-2025')).toBeVisible()

    const assignmentPage = new StudentFeeAssignmentPage(authenticatedPage)
    await assignmentPage.goto()

    await assignmentPage.assignFeeToStudent({
      student: 'Kouassi Aya',
      feeStructure: 'Scolarite 2024-2025',
      paymentPlan: '3 installments',
    })
    await assignmentPage.assign()

    await expect(authenticatedPage.getByText('Kouassi Aya')).toBeVisible()
  })

  test('should process installment payments', async ({ authenticatedPage }) => {
    const paymentPage = new PaymentPage(authenticatedPage)
    await paymentPage.goto()

    await paymentPage.processPayment({
      student: 'Kouassi Aya',
      fee: 'Scolarite 2024-2025',
      amount: '50000',
      paymentMethod: 'cash',
    })
    await paymentPage.save()

    await expect(authenticatedPage.getByText(/success|succès/i)).toBeVisible()
  })

  test('should track outstanding balances', async ({ authenticatedPage }) => {
    const balancePage = new BalanceTrackingPage(authenticatedPage)
    await balancePage.goto()

    await balancePage.viewStudentBalance('Kouassi Aya')

    await expect(balancePage.outstandingBalance).toBeVisible()
  })

  test('should view payment history', async ({ authenticatedPage }) => {
    const historyPage = new PaymentHistoryPage(authenticatedPage)
    await historyPage.goto()

    await historyPage.viewStudentHistory('Kouassi Aya')

    await expect(historyPage.transactionTable).toBeVisible()
  })
})

test.describe('Complete School Workflow', () => {
  test('should execute full school setup and management workflow', async ({ authenticatedPage }) => {
    const timestamp = Date.now()

    const academicYearPage = new AcademicYearPage(authenticatedPage)
    await academicYearPage.goto()

    const yearName = `2024-${timestamp}`
    await academicYearPage.createAcademicYear({
      name: yearName,
      startDate: '2024-09-01',
      endDate: '2025-07-15',
      status: 'active',
    })
    await academicYearPage.save()

    await expect(await academicYearPage.getYearByName(yearName)).toBeVisible()

    const termPage = new TermPage(authenticatedPage)
    await termPage.goto()

    await termPage.createTerm({
      name: '1er Trimestre',
      academicYear: yearName,
      startDate: '2024-09-01',
      endDate: '2024-12-15',
    })
    await termPage.save()

    const gradeLevelPage = new GradeLevelPage(authenticatedPage)
    await gradeLevelPage.goto()

    await gradeLevelPage.createGradeLevel({
      name: `6ème ${timestamp}`,
      level: '1',
      description: 'Sixième année',
    })
    await gradeLevelPage.save()

    const classroomPage = new ClassroomPage(authenticatedPage)
    await classroomPage.goto()

    await classroomPage.createClassroom({
      name: `Salle 101 ${timestamp}`,
      capacity: '30',
      building: 'Principal',
      floor: '1',
    })
    await classroomPage.save()

    const subjectPage = new SubjectPage(authenticatedPage)
    await subjectPage.goto()

    await subjectPage.createSubject({
      name: `Mathématiques ${timestamp}`,
      code: 'MATH',
      coefficient: '4',
    })
    await subjectPage.save()

    const userPage = new UserManagementPage(authenticatedPage)
    await userPage.goto()

    const teacherName = `Prof. Test ${timestamp}`
    const teacherEmail = generateEmail(teacherName)

    await userPage.createUser({
      name: teacherName,
      email: teacherEmail,
      phone: generateIvorianPhone(),
      status: 'active',
    })
    await userPage.save()

    const teacherPage = new TeacherManagementPage(authenticatedPage)
    await teacherPage.goto()

    await teacherPage.createTeacher({
      userId: teacherEmail,
      specialization: 'Mathématiques',
      subjects: ['Mathématiques'],
      hireDate: '2024-01-01',
      status: 'active',
    })
    await teacherPage.save()

    const studentPage = new StudentEnrollmentPage(authenticatedPage)
    await studentPage.goto()

    const studentName = `Étudiant ${timestamp}`
    const parentName = `Parent ${timestamp}`

    await studentPage.createStudentWithParent({
      studentName,
      studentEmail: generateEmail(studentName),
      dateOfBirth: '2010-01-01',
      gradeLevel: `6ème ${timestamp}`,
      parentName,
      parentEmail: generateEmail(parentName),
      parentPhone: generateIvorianPhone(),
    })
    await studentPage.save()

    const classPage = new ClassPage(authenticatedPage)
    await classPage.goto()

    await classPage.createClass({
      name: `6ème A ${timestamp}`,
      gradeLevel: `6ème ${timestamp}`,
      academicYear: yearName,
      classroom: `Salle 101 ${timestamp}`,
      teacher: teacherName,
    })
    await classPage.save()

    const enrollmentPage = new StudentClassEnrollmentPage(authenticatedPage)
    await enrollmentPage.goto()

    await enrollmentPage.enrollStudentInClass(`6ème A ${timestamp}`, studentName)
    await enrollmentPage.save()

    const timetablePage = new TimetablePage(authenticatedPage)
    await timetablePage.goto()

    await timetablePage.createTimetableSlot({
      day: 'Monday',
      period: '08:00-09:00',
      class: `6ème A ${timestamp}`,
      subject: `Mathématiques ${timestamp}`,
      teacher: teacherName,
    })
    await timetablePage.save()

    const feeStructurePage = new FeeStructurePage(authenticatedPage)
    await feeStructurePage.goto()

    await feeStructurePage.createFeeStructure({
      name: `Scolarite ${timestamp}`,
      amount: '150000',
      academicYear: yearName,
    })
    await feeStructurePage.save()

    const assignmentPage = new StudentFeeAssignmentPage(authenticatedPage)
    await assignmentPage.goto()

    await assignmentPage.assignFeeToStudent({
      student: studentName,
      feeStructure: `Scolarite ${timestamp}`,
      paymentPlan: '3 installments',
    })
    await assignmentPage.assign()

    const paymentPage = new PaymentPage(authenticatedPage)
    await paymentPage.goto()

    await paymentPage.processPayment({
      student: studentName,
      fee: `Scolarite ${timestamp}`,
      amount: '50000',
      paymentMethod: 'mobile_money',
    })
    await paymentPage.save()

    await expect(authenticatedPage.getByText(/success|succès/i)).toBeVisible()
  })
})
