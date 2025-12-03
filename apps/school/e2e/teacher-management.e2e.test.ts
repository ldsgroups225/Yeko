import { expect, test } from './fixtures/auth.fixture'
import { TeacherManagementPage, UserManagementPage } from './helpers/page-objects'
import { generateEmail, generateUniqueData } from './helpers/test-data'

test.describe('Teacher Management E2E', () => {
  let teacherPage: TeacherManagementPage
  let userPage: UserManagementPage
  let testUserId: string

  test.beforeEach(async ({ authenticatedPage }) => {
    teacherPage = new TeacherManagementPage(authenticatedPage)
    userPage = new UserManagementPage(authenticatedPage)

    // Create a test user first
    await userPage.goto()
    const userName = generateUniqueData('Teacher User')
    const userEmail = generateEmail(userName)

    await userPage.createUser({
      name: userName,
      email: userEmail,
      status: 'active',
    })
    await userPage.save()

    testUserId = userEmail

    await teacherPage.goto()
  })

  test('should display teachers list page', async ({ authenticatedPage }) => {
    await expect(authenticatedPage).toHaveTitle(/teachers|enseignants/i)
    await expect(teacherPage.newTeacherButton).toBeVisible()
  })

  test('should create a new teacher', async ({ authenticatedPage }) => {
    await teacherPage.createTeacher({
      userId: testUserId,
      specialization: 'Mathématiques',
      hireDate: '2024-02-01',
      status: 'active',
      subjects: ['Mathématiques'],
    })

    await teacherPage.save()

    // Verify teacher appears in list
    await expect(authenticatedPage.getByText('Mathématiques')).toBeVisible()
  })

  test('should create teacher with multiple subjects', async ({ authenticatedPage }) => {
    await teacherPage.createTeacher({
      userId: testUserId,
      specialization: 'Sciences',
      hireDate: '2024-01-10',
      status: 'active',
      subjects: ['Biologie', 'Chimie', 'SVT'],
    })

    await teacherPage.save()

    // Verify teacher with multiple subjects is created
    await expect(authenticatedPage.getByText('Sciences')).toBeVisible()
  })

  test('should edit existing teacher', async ({ authenticatedPage }) => {
    // Create teacher
    await teacherPage.createTeacher({
      userId: testUserId,
      specialization: 'Physique',
      hireDate: '2024-02-01',
      status: 'active',
      subjects: ['Physique'],
    })
    await teacherPage.save()

    // Edit teacher
    const editButton = authenticatedPage.getByRole('button', { name: /edit|modifier/i }).first()
    await editButton.click()

    await teacherPage.specializationInput.clear()
    await teacherPage.specializationInput.fill('Physique-Chimie')
    await teacherPage.save()

    // Verify update
    await expect(authenticatedPage.getByText('Physique-Chimie')).toBeVisible()
  })

  test('should not show user ID field in edit mode', async ({ authenticatedPage }) => {
    // Create teacher
    await teacherPage.createTeacher({
      userId: testUserId,
      specialization: 'Histoire',
      hireDate: '2024-02-01',
      status: 'active',
      subjects: ['Histoire'],
    })
    await teacherPage.save()

    // Edit teacher
    const editButton = authenticatedPage.getByRole('button', { name: /edit|modifier/i }).first()
    await editButton.click()

    // Verify user ID field is not visible
    await expect(teacherPage.userIdSelect).not.toBeVisible()
  })

  test('should validate hire date not in future', async ({ authenticatedPage }) => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const futureDateString = futureDate.toISOString().split('T')[0] || '2025-12-31'

    await teacherPage.createTeacher({
      userId: testUserId,
      specialization: 'Géographie',
      hireDate: futureDateString,
      status: 'active',
      subjects: ['Géographie'],
    })

    await teacherPage.saveButton.click()

    // Verify validation error
    await expect(authenticatedPage.getByText(/future.*date|date.*futur/i)).toBeVisible()
  })

  test('should change teacher status', async ({ authenticatedPage }) => {
    // Create active teacher
    await teacherPage.createTeacher({
      userId: testUserId,
      specialization: 'Anglais',
      hireDate: '2024-02-01',
      status: 'active',
      subjects: ['Anglais'],
    })
    await teacherPage.save()

    // Edit and change status
    const editButton = authenticatedPage.getByRole('button', { name: /edit|modifier/i }).first()
    await editButton.click()

    await teacherPage.statusSelect.selectOption('on_leave')
    await teacherPage.save()

    // Verify status is updated
    await expect(authenticatedPage.getByText(/on.*leave|en.*congé/i)).toBeVisible()
  })

  test('should delete teacher', async ({ authenticatedPage }) => {
    // Create teacher
    await teacherPage.createTeacher({
      userId: testUserId,
      specialization: 'To Delete',
      hireDate: '2024-02-01',
      status: 'active',
      subjects: ['Test'],
    })
    await teacherPage.save()

    // Delete teacher
    const deleteButton = authenticatedPage.getByRole('button', { name: /delete|supprimer/i }).first()
    await deleteButton.click()

    // Confirm deletion
    const confirmButton = authenticatedPage.getByRole('button', { name: /confirm/i })
    await confirmButton.click()

    // Verify teacher is removed
    await expect(authenticatedPage.getByText('To Delete')).not.toBeVisible()
  })

  test('should validate required fields', async ({ authenticatedPage }) => {
    await teacherPage.newTeacherButton.click()

    // Try to save without filling required fields
    await teacherPage.saveButton.click()

    // Verify validation errors appear
    await expect(authenticatedPage.getByText(/required|requis/i)).toBeVisible()
  })

  test('should require at least one subject', async ({ authenticatedPage }) => {
    await teacherPage.createTeacher({
      userId: testUserId,
      specialization: 'Test',
      hireDate: '2024-02-01',
      status: 'active',
      subjects: [], // No subjects
    })

    await teacherPage.saveButton.click()

    // Verify validation error
    await expect(authenticatedPage.getByText(/at least.*subject|au moins.*matière/i)).toBeVisible()
  })

  test('should filter teachers by specialization', async ({ authenticatedPage }) => {
    // Create teachers with different specializations
    const specializations = ['Mathématiques', 'Sciences']

    for (const spec of specializations) {
      await userPage.goto()
      const userName = generateUniqueData(`Teacher ${spec}`)
      const userEmail = generateEmail(userName)

      await userPage.createUser({
        name: userName,
        email: userEmail,
        status: 'active',
      })
      await userPage.save()

      await teacherPage.goto()
      await teacherPage.createTeacher({
        userId: userEmail,
        specialization: spec,
        hireDate: '2024-02-01',
        status: 'active',
        subjects: [spec],
      })
      await teacherPage.save()
    }

    // Filter by Mathématiques
    const specFilter = authenticatedPage.getByLabel(/specialization|spécialisation/i).first()
    await specFilter.selectOption('Mathématiques')

    // Verify only math teachers are visible
    await expect(authenticatedPage.getByText('Mathématiques')).toBeVisible()
  })

  test('should search teachers by name', async ({ authenticatedPage }) => {
    const searchTerm = generateUniqueData('Searchable')

    await userPage.goto()
    const userName = `${searchTerm} Teacher`
    const userEmail = generateEmail(userName)

    await userPage.createUser({
      name: userName,
      email: userEmail,
      status: 'active',
    })
    await userPage.save()

    await teacherPage.goto()
    await teacherPage.createTeacher({
      userId: userEmail,
      specialization: 'Test',
      hireDate: '2024-02-01',
      status: 'active',
      subjects: ['Test'],
    })
    await teacherPage.save()

    // Search for teacher
    const searchInput = authenticatedPage.getByPlaceholder(/search|rechercher/i)
    await searchInput.fill(searchTerm)

    // Verify search results
    await expect(authenticatedPage.getByText(userName)).toBeVisible()
  })

  test('should display assigned subjects', async ({ authenticatedPage }) => {
    await teacherPage.createTeacher({
      userId: testUserId,
      specialization: 'Sciences',
      hireDate: '2024-02-01',
      status: 'active',
      subjects: ['Biologie', 'Chimie'],
    })
    await teacherPage.save()

    // Verify subjects are displayed
    await expect(authenticatedPage.getByText('Biologie')).toBeVisible()
    await expect(authenticatedPage.getByText('Chimie')).toBeVisible()
  })

  test('should add and remove subjects', async ({ authenticatedPage }) => {
    // Create teacher with one subject
    await teacherPage.createTeacher({
      userId: testUserId,
      specialization: 'Langues',
      hireDate: '2024-02-01',
      status: 'active',
      subjects: ['Français'],
    })
    await teacherPage.save()

    // Edit and add more subjects
    const editButton = authenticatedPage.getByRole('button', { name: /edit|modifier/i }).first()
    await editButton.click()

    await teacherPage.assignSubject('Anglais')
    await teacherPage.assignSubject('Espagnol')
    await teacherPage.save()

    // Verify all subjects are displayed
    await expect(authenticatedPage.getByText('Français')).toBeVisible()
    await expect(authenticatedPage.getByText('Anglais')).toBeVisible()
    await expect(authenticatedPage.getByText('Espagnol')).toBeVisible()
  })

  test('should cancel teacher creation', async () => {
    await teacherPage.newTeacherButton.click()
    await teacherPage.specializationInput.fill('Cancelled')
    await teacherPage.cancel()

    // Verify we're back on the list page
    await expect(teacherPage.newTeacherButton).toBeVisible()
  })

  test('should display teacher details', async ({ authenticatedPage }) => {
    await teacherPage.createTeacher({
      userId: testUserId,
      specialization: 'Informatique',
      hireDate: '2024-02-01',
      status: 'active',
      subjects: ['Informatique', 'Technologie'],
    })
    await teacherPage.save()

    // Click on teacher to view details
    const viewButton = authenticatedPage.getByRole('button', { name: /view|voir/i }).first()
    await viewButton.click()

    // Verify details are displayed
    await expect(authenticatedPage.getByText('Informatique')).toBeVisible()
    await expect(authenticatedPage.getByText('Technologie')).toBeVisible()
  })

  test('should show subject count', async ({ authenticatedPage }) => {
    await teacherPage.createTeacher({
      userId: testUserId,
      specialization: 'Multi-subject',
      hireDate: '2024-02-01',
      status: 'active',
      subjects: ['Math', 'Physics', 'Chemistry'],
    })
    await teacherPage.save()

    // Verify subject count is displayed
    await expect(authenticatedPage.getByText(/3.*subject/i)).toBeVisible()
  })
})
