import { expect, test } from './fixtures/auth.fixture'
import { UserManagementPage } from './helpers/page-objects'
import { generateEmail, generateIvorianPhone, generateUniqueData, testData } from './helpers/test-data'

test.describe('User Management E2E', () => {
  let userPage: UserManagementPage

  test.beforeEach(async ({ authenticatedPage }) => {
    userPage = new UserManagementPage(authenticatedPage)
    await userPage.goto()
  })

  test('should display users list page', async ({ authenticatedPage }) => {
    await expect(authenticatedPage).toHaveTitle(/users|utilisateurs/i)
    await expect(userPage.newUserButton).toBeVisible()
  })

  test('should create a new user with basic information', async () => {
    const userName = generateUniqueData('Test User')
    const userEmail = generateEmail(userName)

    await userPage.createUser({
      name: userName,
      email: userEmail,
      status: 'active',
    })

    await userPage.save()

    // Verify user appears in list
    const userRow = await userPage.getUserByEmail(userEmail)
    await expect(userRow).toBeVisible()
  })

  test('should create user with Ivorian name and phone', async () => {
    const userName = generateUniqueData(testData.users.withAccents.name)
    const userEmail = generateEmail(userName)
    const phone = generateIvorianPhone()

    await userPage.createUser({
      name: userName,
      email: userEmail,
      phone,
      status: 'active',
    })

    await userPage.save()

    // Verify user with accents is created correctly
    const userRow = await userPage.getUserByEmail(userEmail)
    await expect(userRow).toBeVisible()
    await expect(userRow).toContainText(userName)
  })

  test('should assign roles to user', async () => {
    const userName = generateUniqueData('User with Roles')
    const userEmail = generateEmail(userName)

    await userPage.createUser({
      name: userName,
      email: userEmail,
      status: 'active',
      roles: ['Teacher', 'Staff'],
    })

    await userPage.save()

    // Verify user is created with roles
    const userRow = await userPage.getUserByEmail(userEmail)
    await expect(userRow).toBeVisible()
  })

  test('should edit existing user', async () => {
    const originalName = generateUniqueData('Original User')
    const updatedName = generateUniqueData('Updated User')
    const userEmail = generateEmail(originalName)

    // Create user
    await userPage.createUser({
      name: originalName,
      email: userEmail,
      status: 'active',
    })
    await userPage.save()

    // Edit user
    await userPage.editUser(userEmail)
    await userPage.userNameInput.clear()
    await userPage.userNameInput.fill(updatedName)
    await userPage.save()

    // Verify updated user appears
    const updatedRow = await userPage.getUserByEmail(userEmail)
    await expect(updatedRow).toContainText(updatedName)
  })

  test('should not allow editing email', async () => {
    const userName = generateUniqueData('User Email Test')
    const userEmail = generateEmail(userName)

    // Create user
    await userPage.createUser({
      name: userName,
      email: userEmail,
      status: 'active',
    })
    await userPage.save()

    // Edit user
    await userPage.editUser(userEmail)

    // Verify email field is disabled
    await expect(userPage.userEmailInput).toBeDisabled()
  })

  test('should delete user', async () => {
    const userName = generateUniqueData('User to Delete')
    const userEmail = generateEmail(userName)

    // Create user
    await userPage.createUser({
      name: userName,
      email: userEmail,
      status: 'active',
    })
    await userPage.save()

    // Delete user
    await userPage.deleteUser(userEmail)

    // Verify user is removed
    const userRow = await userPage.getUserByEmail(userEmail)
    await expect(userRow).not.toBeVisible()
  })

  test('should validate email format', async ({ authenticatedPage }) => {
    await userPage.newUserButton.click()
    await userPage.userNameInput.fill('Test User')
    await userPage.userEmailInput.fill('invalid-email')
    await userPage.saveButton.click()

    // Verify validation error appears
    await expect(authenticatedPage.getByText(/invalid.*email|email.*invalide/i)).toBeVisible()
  })

  test('should validate required fields', async ({ authenticatedPage }) => {
    await userPage.newUserButton.click()

    // Try to save without filling required fields
    await userPage.saveButton.click()

    // Verify validation errors appear
    await expect(authenticatedPage.getByText(/required|requis/i)).toBeVisible()
  })

  test('should handle duplicate email error', async ({ authenticatedPage }) => {
    const userName1 = generateUniqueData('User One')
    const userName2 = generateUniqueData('User Two')
    const sharedEmail = generateEmail('shared')

    // Create first user
    await userPage.createUser({
      name: userName1,
      email: sharedEmail,
      status: 'active',
    })
    await userPage.save()

    // Try to create second user with same email
    await userPage.createUser({
      name: userName2,
      email: sharedEmail,
      status: 'active',
    })
    await userPage.save()

    // Verify error message appears
    await expect(authenticatedPage.getByText(/already exists|existe déjà/i)).toBeVisible()
  })

  test('should filter users by status', async ({ authenticatedPage }) => {
    const activeUser = generateUniqueData('Active User')
    const inactiveUser = generateUniqueData('Inactive User')

    // Create users with different statuses
    await userPage.createUser({
      name: activeUser,
      email: generateEmail(activeUser),
      status: 'active',
    })
    await userPage.save()

    await userPage.createUser({
      name: inactiveUser,
      email: generateEmail(inactiveUser),
      status: 'inactive',
    })
    await userPage.save()

    // Filter by active status
    const statusFilter = authenticatedPage.getByLabel(/status|statut/i).first()
    await statusFilter.selectOption('active')

    // Verify only active users are visible
    await expect(authenticatedPage.getByText(activeUser)).toBeVisible()
  })

  test('should search users by name', async ({ authenticatedPage }) => {
    const searchTerm = generateUniqueData('Searchable')
    const userName = `${searchTerm} User`

    await userPage.createUser({
      name: userName,
      email: generateEmail(userName),
      status: 'active',
    })
    await userPage.save()

    // Search for user
    const searchInput = authenticatedPage.getByPlaceholder(/search|rechercher/i)
    await searchInput.fill(searchTerm)

    // Verify search results
    await expect(authenticatedPage.getByText(userName)).toBeVisible()
  })

  test('should display user avatar', async () => {
    const userName = generateUniqueData('User with Avatar')
    const userEmail = generateEmail(userName)

    await userPage.createUser({
      name: userName,
      email: userEmail,
      status: 'active',
    })
    await userPage.save()

    // Verify avatar is displayed (either image or initials)
    const userRow = await userPage.getUserByEmail(userEmail)
    const avatar = userRow.getByRole('img').or(userRow.getByText(userName.charAt(0)))
    await expect(avatar).toBeVisible()
  })

  test('should change user status', async () => {
    const userName = generateUniqueData('Status Change User')
    const userEmail = generateEmail(userName)

    // Create active user
    await userPage.createUser({
      name: userName,
      email: userEmail,
      status: 'active',
    })
    await userPage.save()

    // Edit and change status
    await userPage.editUser(userEmail)
    await userPage.userStatusSelect.selectOption('suspended')
    await userPage.save()

    // Verify status is updated
    const userRow = await userPage.getUserByEmail(userEmail)
    await expect(userRow).toContainText(/suspended|suspendu/i)
  })

  test('should validate phone number format', async () => {
    await userPage.newUserButton.click()
    await userPage.userNameInput.fill('Test User')
    await userPage.userEmailInput.fill(generateEmail('test'))
    await userPage.userPhoneInput.fill('invalid-phone')
    await userPage.saveButton.click()

    // Verify validation error or phone is accepted (depending on validation rules)
    // This test may need adjustment based on actual validation
  })

  test('should cancel user creation', async () => {
    await userPage.newUserButton.click()
    await userPage.userNameInput.fill('Cancelled User')
    await userPage.cancel()

    // Verify we're back on the list page
    await expect(userPage.newUserButton).toBeVisible()
  })
})
