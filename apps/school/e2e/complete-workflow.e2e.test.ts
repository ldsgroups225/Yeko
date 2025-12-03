import { expect, test } from './fixtures/auth.fixture'
import { RoleManagementPage, StaffManagementPage, TeacherManagementPage, UserManagementPage } from './helpers/page-objects'
import { generateEmail, generateIvorianPhone, generateUniqueData } from './helpers/test-data'

/**
 * Complete E2E Workflow Tests
 * Tests the full user journey through the HR module
 */

test.describe('Complete HR Module Workflow', () => {
  test('should complete full HR setup workflow', async ({ authenticatedPage }) => {
    // Step 1: Create a role
    const rolePage = new RoleManagementPage(authenticatedPage)
    await rolePage.goto()

    const roleName = generateUniqueData('Teacher Role')
    await rolePage.createRole({
      name: roleName,
      description: 'Role for teachers',
      scope: 'school',
    })

    // Set permissions for teachers
    await rolePage.setPermission('students', 'view', true)
    await rolePage.setPermission('students', 'edit', true)
    await rolePage.setPermission('grades', 'create', true)
    await rolePage.save()

    // Verify role was created
    await expect(await rolePage.getRoleByName(roleName)).toBeVisible()

    // Step 2: Create a user
    const userPage = new UserManagementPage(authenticatedPage)
    await userPage.goto()

    const userName = generateUniqueData('Kouassi Yao')
    const userEmail = generateEmail(userName)
    const userPhone = generateIvorianPhone()

    await userPage.createUser({
      name: userName,
      email: userEmail,
      phone: userPhone,
      status: 'active',
      roles: [roleName],
    })
    await userPage.save()

    // Verify user was created
    await expect(await userPage.getUserByEmail(userEmail)).toBeVisible()

    // Step 3: Create teacher profile for the user
    const teacherPage = new TeacherManagementPage(authenticatedPage)
    await teacherPage.goto()

    await teacherPage.createTeacher({
      userId: userEmail,
      specialization: 'Mathématiques',
      hireDate: '2024-01-15',
      status: 'active',
      subjects: ['Mathématiques', 'Physique'],
    })
    await teacherPage.save()

    // Verify teacher was created
    await expect(authenticatedPage.getByText('Mathématiques')).toBeVisible()

    // Step 4: Verify complete profile
    await userPage.goto()
    const userRow = await userPage.getUserByEmail(userEmail)
    await expect(userRow).toContainText(userName)
    await expect(userRow).toContainText(roleName)
  })

  test('should handle staff member complete workflow', async ({ authenticatedPage }) => {
    // Create role for staff
    const rolePage = new RoleManagementPage(authenticatedPage)
    await rolePage.goto()

    const roleName = generateUniqueData('Admin Staff')
    await rolePage.createRole({
      name: roleName,
      description: 'Administrative staff role',
      scope: 'school',
    })
    await rolePage.selectAllPermissions()
    await rolePage.save()

    // Create user
    const userPage = new UserManagementPage(authenticatedPage)
    await userPage.goto()

    const userName = generateUniqueData('Aïcha Traoré')
    const userEmail = generateEmail(userName)

    await userPage.createUser({
      name: userName,
      email: userEmail,
      status: 'active',
      roles: [roleName],
    })
    await userPage.save()

    // Create staff profile
    const staffPage = new StaffManagementPage(authenticatedPage)
    await staffPage.goto()

    await staffPage.createStaff({
      userId: userEmail,
      position: 'principal',
      department: 'Administration',
      hireDate: '2024-01-01',
      status: 'active',
    })
    await staffPage.save()

    // Verify complete workflow
    await expect(authenticatedPage.getByText(/principal/i)).toBeVisible()
    await expect(authenticatedPage.getByText('Administration')).toBeVisible()
  })

  test('should handle role update affecting users', async ({ authenticatedPage }) => {
    // Create role
    const rolePage = new RoleManagementPage(authenticatedPage)
    await rolePage.goto()

    const roleName = generateUniqueData('Limited Role')
    await rolePage.createRole({
      name: roleName,
      description: 'Role with limited permissions',
      scope: 'school',
    })
    await rolePage.setPermission('users', 'view', true)
    await rolePage.save()

    // Create user with this role
    const userPage = new UserManagementPage(authenticatedPage)
    await userPage.goto()

    const userName = generateUniqueData('Test User')
    const userEmail = generateEmail(userName)

    await userPage.createUser({
      name: userName,
      email: userEmail,
      status: 'active',
      roles: [roleName],
    })
    await userPage.save()

    // Update role permissions
    await rolePage.goto()
    await rolePage.editRole(roleName)
    await rolePage.setPermission('users', 'create', true)
    await rolePage.setPermission('users', 'edit', true)
    await rolePage.save()

    // Verify role was updated
    const roleRow = await rolePage.getRoleByName(roleName)
    await expect(roleRow).toBeVisible()
  })

  test('should handle user status changes', async ({ authenticatedPage }) => {
    // Create user
    const userPage = new UserManagementPage(authenticatedPage)
    await userPage.goto()

    const userName = generateUniqueData('Status Test User')
    const userEmail = generateEmail(userName)

    await userPage.createUser({
      name: userName,
      email: userEmail,
      status: 'active',
    })
    await userPage.save()

    // Create teacher profile
    const teacherPage = new TeacherManagementPage(authenticatedPage)
    await teacherPage.goto()

    await teacherPage.createTeacher({
      userId: userEmail,
      specialization: 'Sciences',
      hireDate: '2024-02-01',
      status: 'active',
      subjects: ['Biologie'],
    })
    await teacherPage.save()

    // Change user status to suspended
    await userPage.goto()
    await userPage.editUser(userEmail)
    await userPage.userStatusSelect.selectOption('suspended')
    await userPage.save()

    // Verify status change
    const userRow = await userPage.getUserByEmail(userEmail)
    await expect(userRow).toContainText(/suspended|suspendu/i)

    // Change teacher status to on_leave
    await teacherPage.goto()
    const editButton = authenticatedPage.getByRole('button', { name: /edit|modifier/i }).first()
    await editButton.click()
    await teacherPage.statusSelect.selectOption('on_leave')
    await teacherPage.save()

    // Verify teacher status change
    await expect(authenticatedPage.getByText(/on.*leave|en.*congé/i)).toBeVisible()
  })

  test('should handle bulk operations', async ({ authenticatedPage }) => {
    const rolePage = new RoleManagementPage(authenticatedPage)
    const userPage = new UserManagementPage(authenticatedPage)

    // Create multiple roles
    const roles = ['Teacher', 'Staff', 'Admin'].map(r => generateUniqueData(r))

    for (const roleName of roles) {
      await rolePage.goto()
      await rolePage.createRole({
        name: roleName,
        description: `${roleName} role`,
        scope: 'school',
      })
      await rolePage.save()
    }

    // Create multiple users with different roles
    for (let i = 0; i < 3; i++) {
      await userPage.goto()
      const userName = generateUniqueData(`User ${i}`)
      const userEmail = generateEmail(userName)
      const roleName = roles[i]

      if (!roleName)
        continue

      await userPage.createUser({
        name: userName,
        email: userEmail,
        status: 'active',
        roles: [roleName],
      })
      await userPage.save()
    }

    // Verify all users were created
    await userPage.goto()
    for (let i = 0; i < 3; i++) {
      const userName = `User ${i}`
      await expect(authenticatedPage.getByText(new RegExp(userName))).toBeVisible()
    }
  })

  test('should navigate between HR sections', async ({ authenticatedPage }) => {
    // Start at roles
    await authenticatedPage.goto('/app/hr/roles')
    await expect(authenticatedPage).toHaveURL(/\/roles/)

    // Navigate to users
    await authenticatedPage.goto('/app/hr/users')
    await expect(authenticatedPage).toHaveURL(/\/users/)

    // Navigate to staff
    await authenticatedPage.goto('/app/hr/staff')
    await expect(authenticatedPage).toHaveURL(/\/staff/)

    // Navigate to teachers
    await authenticatedPage.goto('/app/hr/teachers')
    await expect(authenticatedPage).toHaveURL(/\/teachers/)

    // Navigate back to dashboard
    await authenticatedPage.goto('/app/dashboard')
    await expect(authenticatedPage).toHaveURL(/\/dashboard/)
  })

  test('should handle error recovery', async ({ authenticatedPage }) => {
    const userPage = new UserManagementPage(authenticatedPage)
    await userPage.goto()

    // Try to create user with invalid email
    await userPage.newUserButton.click()
    await userPage.userNameInput.fill('Test User')
    await userPage.userEmailInput.fill('invalid-email')
    await userPage.saveButton.click()

    // Verify error is shown
    await expect(authenticatedPage.getByText(/invalid.*email|email.*invalide/i)).toBeVisible()

    // Fix the error
    await userPage.userEmailInput.clear()
    await userPage.userEmailInput.fill(generateEmail('test'))
    await userPage.save()

    // Verify user was created after fixing error
    await expect(authenticatedPage.getByText('Test User')).toBeVisible()
  })
})
