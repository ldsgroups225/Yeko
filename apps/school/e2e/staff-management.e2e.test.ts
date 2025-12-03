import { expect, test } from './fixtures/auth.fixture'
import { StaffManagementPage, UserManagementPage } from './helpers/page-objects'
import { generateEmail, generateUniqueData } from './helpers/test-data'

test.describe('Staff Management E2E', () => {
  let staffPage: StaffManagementPage
  let userPage: UserManagementPage
  let testUserId: string

  test.beforeEach(async ({ authenticatedPage }) => {
    staffPage = new StaffManagementPage(authenticatedPage)
    userPage = new UserManagementPage(authenticatedPage)

    // Create a test user first
    await userPage.goto()
    const userName = generateUniqueData('Staff User')
    const userEmail = generateEmail(userName)

    await userPage.createUser({
      name: userName,
      email: userEmail,
      status: 'active',
    })
    await userPage.save()

    // Store user ID for staff creation (this would need to be extracted from the UI)
    testUserId = userEmail // Using email as identifier for simplicity

    await staffPage.goto()
  })

  test('should display staff list page', async ({ authenticatedPage }) => {
    await expect(authenticatedPage).toHaveTitle(/staff|personnel/i)
    await expect(staffPage.newStaffButton).toBeVisible()
  })

  test('should create a new staff member', async ({ authenticatedPage }) => {
    await staffPage.createStaff({
      userId: testUserId,
      position: 'principal',
      department: 'Administration',
      hireDate: '2024-01-15',
      status: 'active',
    })

    await staffPage.save()

    // Verify staff member appears in list
    await expect(authenticatedPage.getByText(/principal/i)).toBeVisible()
  })

  test('should create staff with different positions', async ({ authenticatedPage }) => {
    const positions = ['principal', 'vice_principal', 'secretary', 'accountant', 'librarian', 'counselor']

    for (const position of positions) {
      // Create new user for each staff member
      await userPage.goto()
      const userName = generateUniqueData(`Staff ${position}`)
      const userEmail = generateEmail(userName)

      await userPage.createUser({
        name: userName,
        email: userEmail,
        status: 'active',
      })
      await userPage.save()

      // Create staff member
      await staffPage.goto()
      await staffPage.createStaff({
        userId: userEmail,
        position,
        department: 'Test Department',
        hireDate: '2024-01-15',
        status: 'active',
      })
      await staffPage.save()

      // Verify staff member is created
      await expect(authenticatedPage.getByText(new RegExp(position, 'i'))).toBeVisible()
    }
  })

  test('should edit existing staff member', async ({ authenticatedPage }) => {
    // Create staff member
    await staffPage.createStaff({
      userId: testUserId,
      position: 'secretary',
      department: 'Original Department',
      hireDate: '2024-01-15',
      status: 'active',
    })
    await staffPage.save()

    // Edit staff member
    const editButton = authenticatedPage.getByRole('button', { name: /edit|modifier/i }).first()
    await editButton.click()

    await staffPage.departmentInput.clear()
    await staffPage.departmentInput.fill('Updated Department')
    await staffPage.save()

    // Verify update
    await expect(authenticatedPage.getByText('Updated Department')).toBeVisible()
  })

  test('should not show user ID field in edit mode', async ({ authenticatedPage }) => {
    // Create staff member
    await staffPage.createStaff({
      userId: testUserId,
      position: 'accountant',
      department: 'Finance',
      hireDate: '2024-01-15',
      status: 'active',
    })
    await staffPage.save()

    // Edit staff member
    const editButton = authenticatedPage.getByRole('button', { name: /edit|modifier/i }).first()
    await editButton.click()

    // Verify user ID field is not visible or disabled
    await expect(staffPage.userIdSelect).not.toBeVisible()
  })

  test('should validate hire date not in future', async ({ authenticatedPage }) => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const futureDateString = futureDate.toISOString().split('T')[0] || '2025-12-31'

    await staffPage.createStaff({
      userId: testUserId,
      position: 'librarian',
      department: 'Library',
      hireDate: futureDateString,
      status: 'active',
    })

    await staffPage.saveButton.click()

    // Verify validation error
    await expect(authenticatedPage.getByText(/future.*date|date.*futur/i)).toBeVisible()
  })

  test('should change staff status', async ({ authenticatedPage }) => {
    // Create active staff member
    await staffPage.createStaff({
      userId: testUserId,
      position: 'counselor',
      department: 'Counseling',
      hireDate: '2024-01-15',
      status: 'active',
    })
    await staffPage.save()

    // Edit and change status
    const editButton = authenticatedPage.getByRole('button', { name: /edit|modifier/i }).first()
    await editButton.click()

    await staffPage.statusSelect.selectOption('on_leave')
    await staffPage.save()

    // Verify status is updated
    await expect(authenticatedPage.getByText(/on.*leave|en.*congé/i)).toBeVisible()
  })

  test('should delete staff member', async ({ authenticatedPage }) => {
    // Create staff member
    await staffPage.createStaff({
      userId: testUserId,
      position: 'secretary',
      department: 'To Delete',
      hireDate: '2024-01-15',
      status: 'active',
    })
    await staffPage.save()

    // Delete staff member
    const deleteButton = authenticatedPage.getByRole('button', { name: /delete|supprimer/i }).first()
    await deleteButton.click()

    // Confirm deletion
    const confirmButton = authenticatedPage.getByRole('button', { name: /confirm/i })
    await confirmButton.click()

    // Verify staff member is removed
    await expect(authenticatedPage.getByText('To Delete')).not.toBeVisible()
  })

  test('should validate required fields', async ({ authenticatedPage }) => {
    await staffPage.newStaffButton.click()

    // Try to save without filling required fields
    await staffPage.saveButton.click()

    // Verify validation errors appear
    await expect(authenticatedPage.getByText(/required|requis/i)).toBeVisible()
  })

  test('should filter staff by position', async ({ authenticatedPage }) => {
    // Create staff members with different positions
    const positions = ['principal', 'secretary']

    for (const position of positions) {
      await userPage.goto()
      const userName = generateUniqueData(`Filter ${position}`)
      const userEmail = generateEmail(userName)

      await userPage.createUser({
        name: userName,
        email: userEmail,
        status: 'active',
      })
      await userPage.save()

      await staffPage.goto()
      await staffPage.createStaff({
        userId: userEmail,
        position,
        department: 'Test',
        hireDate: '2024-01-15',
        status: 'active',
      })
      await staffPage.save()
    }

    // Filter by principal
    const positionFilter = authenticatedPage.getByLabel(/position|poste/i).first()
    await positionFilter.selectOption('principal')

    // Verify only principals are visible
    await expect(authenticatedPage.getByText(/principal/i)).toBeVisible()
  })

  test('should search staff by department', async ({ authenticatedPage }) => {
    const searchTerm = generateUniqueData('Unique Dept')

    await staffPage.createStaff({
      userId: testUserId,
      position: 'accountant',
      department: searchTerm,
      hireDate: '2024-01-15',
      status: 'active',
    })
    await staffPage.save()

    // Search for department
    const searchInput = authenticatedPage.getByPlaceholder(/search|rechercher/i)
    await searchInput.fill(searchTerm)

    // Verify search results
    await expect(authenticatedPage.getByText(searchTerm)).toBeVisible()
  })

  test('should cancel staff creation', async () => {
    await staffPage.newStaffButton.click()
    await staffPage.positionSelect.selectOption('librarian')
    await staffPage.cancel()

    // Verify we're back on the list page
    await expect(staffPage.newStaffButton).toBeVisible()
  })

  test('should display staff member details', async ({ authenticatedPage }) => {
    await staffPage.createStaff({
      userId: testUserId,
      position: 'vice_principal',
      department: 'Academic Affairs',
      hireDate: '2024-01-15',
      status: 'active',
    })
    await staffPage.save()

    // Click on staff member to view details
    const viewButton = authenticatedPage.getByRole('button', { name: /view|voir/i }).first()
    await viewButton.click()

    // Verify details are displayed
    await expect(authenticatedPage.getByText('Academic Affairs')).toBeVisible()
    await expect(authenticatedPage.getByText(/vice.*principal/i)).toBeVisible()
  })
})
