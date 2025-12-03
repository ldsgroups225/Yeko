import { expect, test } from './fixtures/auth.fixture'
import { RoleManagementPage } from './helpers/page-objects'
import { generateUniqueData, testData } from './helpers/test-data'

test.describe('Role Management E2E', () => {
  let rolePage: RoleManagementPage

  test.beforeEach(async ({ authenticatedPage }) => {
    rolePage = new RoleManagementPage(authenticatedPage)
    await rolePage.goto()
  })

  test('should display roles list page', async ({ authenticatedPage }) => {
    await expect(authenticatedPage).toHaveTitle(/roles|rôles/i)
    await expect(rolePage.newRoleButton).toBeVisible()
  })

  test('should create a new role with basic information', async () => {
    const roleName = generateUniqueData('Test Role')

    await rolePage.createRole({
      name: roleName,
      description: 'Test role description',
      scope: 'school',
    })

    await rolePage.save()

    // Verify role appears in list
    const roleRow = await rolePage.getRoleByName(roleName)
    await expect(roleRow).toBeVisible()
  })

  test('should create role with French accents', async () => {
    const roleName = generateUniqueData(testData.roles.withAccents.name)

    await rolePage.createRole({
      name: roleName,
      description: testData.roles.withAccents.description,
      scope: 'school',
    })

    await rolePage.save()

    // Verify role with accents is created correctly
    const roleRow = await rolePage.getRoleByName(roleName)
    await expect(roleRow).toBeVisible()
  })

  test('should auto-generate slug from role name', async () => {
    await rolePage.newRoleButton.click()
    await rolePage.roleNameInput.fill('Directeur Pédagogique')
    await rolePage.generateSlugButton.click()

    // Verify slug is generated correctly (lowercase, no accents, hyphens)
    await expect(rolePage.roleSlugInput).toHaveValue(/directeur-pedagogique/i)
  })

  test('should manage permissions with matrix', async () => {
    const roleName = generateUniqueData('Admin Role')

    await rolePage.createRole({
      name: roleName,
      description: 'Admin role with full permissions',
      scope: 'system',
    })

    // Select all permissions
    await rolePage.selectAllPermissions()

    // Verify permissions matrix is visible
    await expect(rolePage.permissionsMatrix).toBeVisible()

    await rolePage.save()

    // Verify role is created
    const roleRow = await rolePage.getRoleByName(roleName)
    await expect(roleRow).toBeVisible()
  })

  test('should edit existing role', async () => {
    const originalName = generateUniqueData('Original Role')
    const updatedName = generateUniqueData('Updated Role')

    // Create role
    await rolePage.createRole({
      name: originalName,
      description: 'Original description',
      scope: 'school',
    })
    await rolePage.save()

    // Edit role
    await rolePage.editRole(originalName)
    await rolePage.roleNameInput.clear()
    await rolePage.roleNameInput.fill(updatedName)
    await rolePage.save()

    // Verify updated role appears
    const updatedRow = await rolePage.getRoleByName(updatedName)
    await expect(updatedRow).toBeVisible()
  })

  test('should delete role', async () => {
    const roleName = generateUniqueData('Role to Delete')

    // Create role
    await rolePage.createRole({
      name: roleName,
      description: 'This role will be deleted',
      scope: 'school',
    })
    await rolePage.save()

    // Delete role
    await rolePage.deleteRole(roleName)

    // Verify role is removed
    const roleRow = await rolePage.getRoleByName(roleName)
    await expect(roleRow).not.toBeVisible()
  })

  test('should cancel role creation', async () => {
    await rolePage.newRoleButton.click()
    await rolePage.roleNameInput.fill('Cancelled Role')
    await rolePage.cancel()

    // Verify we're back on the list page
    await expect(rolePage.newRoleButton).toBeVisible()
  })

  test('should validate required fields', async ({ authenticatedPage }) => {
    await rolePage.newRoleButton.click()

    // Try to save without filling required fields
    await rolePage.saveButton.click()

    // Verify validation errors appear
    await expect(authenticatedPage.getByText(/required|requis/i)).toBeVisible()
  })

  test('should handle duplicate slug error', async ({ authenticatedPage }) => {
    const roleName1 = generateUniqueData('Role One')
    const roleName2 = generateUniqueData('Role Two')
    const slug = 'duplicate-slug'

    // Create first role with specific slug
    await rolePage.createRole({
      name: roleName1,
      slug,
      scope: 'school',
    })
    await rolePage.save()

    // Try to create second role with same slug
    await rolePage.createRole({
      name: roleName2,
      slug,
      scope: 'school',
    })
    await rolePage.save()

    // Verify error message appears
    await expect(authenticatedPage.getByText(/already exists|existe déjà/i)).toBeVisible()
  })

  test('should filter roles by scope', async ({ authenticatedPage }) => {
    // Create roles with different scopes
    const schoolRole = generateUniqueData('School Role')
    const systemRole = generateUniqueData('System Role')

    await rolePage.createRole({
      name: schoolRole,
      scope: 'school',
    })
    await rolePage.save()

    await rolePage.createRole({
      name: systemRole,
      scope: 'system',
    })
    await rolePage.save()

    // Filter by school scope
    const scopeFilter = authenticatedPage.getByLabel(/scope|portée/i)
    await scopeFilter.selectOption('school')

    // Verify only school roles are visible
    await expect(await rolePage.getRoleByName(schoolRole)).toBeVisible()
  })

  test('should search roles by name', async ({ authenticatedPage }) => {
    const searchTerm = generateUniqueData('Searchable')

    await rolePage.createRole({
      name: `${searchTerm} Role`,
      scope: 'school',
    })
    await rolePage.save()

    // Search for role
    const searchInput = authenticatedPage.getByPlaceholder(/search|rechercher/i)
    await searchInput.fill(searchTerm)

    // Verify search results
    await expect(await rolePage.getRoleByName(`${searchTerm} Role`)).toBeVisible()
  })

  test('should display permissions count', async () => {
    const roleName = generateUniqueData('Counted Permissions')

    await rolePage.createRole({
      name: roleName,
      scope: 'school',
    })

    // Set specific permissions
    await rolePage.setPermission('users', 'view', true)
    await rolePage.setPermission('users', 'create', true)
    await rolePage.setPermission('roles', 'view', true)

    await rolePage.save()

    // Verify permissions count is displayed
    const roleRow = await rolePage.getRoleByName(roleName)
    await expect(roleRow.getByText(/3.*permission/i)).toBeVisible()
  })
})
