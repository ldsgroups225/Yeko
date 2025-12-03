# E2E Testing for Yeko HR Module

Comprehensive end-to-end testing suite for the Yeko HR Module using Playwright.

## 📋 Overview

This E2E test suite covers the complete user journey through the HR module, including:

- Role management (CRUD operations, permissions)
- User management (creation, editing, role assignment)
- Staff management (positions, departments, hire dates)
- Teacher management (subjects, specializations)
- Complete workflows (role → user → staff/teacher)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm installed
- Development server running on `http://localhost:3001`
- Test database with seed data

### Installation

Playwright is already installed as a dev dependency. To install browsers:

```bash
pnpm exec playwright install
```

## 🧪 Running Tests

### Run all E2E tests

```bash
pnpm test:e2e
```

### Run tests in UI mode (interactive)

```bash
pnpm test:e2e:ui
```

### Run tests in headed mode (see browser)

```bash
pnpm test:e2e:headed
```

### Run tests in debug mode

```bash
pnpm test:e2e:debug
```

### Run tests for specific browser

```bash
pnpm test:e2e:chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit
```

### Run specific test file

```bash
pnpm test:e2e role-management.e2e.test.ts
pnpm test:e2e user-management.e2e.test.ts
```

### Run tests matching a pattern

```bash
pnpm test:e2e --grep "should create"
pnpm test:e2e --grep "French accents"
```

### View test report

```bash
pnpm test:e2e:report
```

## 📁 Test Structure

```
e2e/
├── fixtures/
│   └── auth.fixture.ts          # Authentication setup
├── helpers/
│   ├── page-objects.ts          # Page Object Models
│   └── test-data.ts             # Test data generators
├── role-management.e2e.test.ts  # Role CRUD tests (13 tests)
├── user-management.e2e.test.ts  # User CRUD tests (15 tests)
├── staff-management.e2e.test.ts # Staff CRUD tests (12 tests)
├── teacher-management.e2e.test.ts # Teacher CRUD tests (14 tests)
├── complete-workflow.e2e.test.ts # Full workflow tests (7 tests)
└── README.md                    # This file
```

## 🎯 Test Coverage

### Role Management (13 tests)

- ✅ Display roles list page
- ✅ Create role with basic information
- ✅ Create role with French accents
- ✅ Auto-generate slug from role name
- ✅ Manage permissions with matrix
- ✅ Edit existing role
- ✅ Delete role
- ✅ Cancel role creation
- ✅ Validate required fields
- ✅ Handle duplicate slug error
- ✅ Filter roles by scope
- ✅ Search roles by name
- ✅ Display permissions count

### User Management (15 tests)

- ✅ Display users list page
- ✅ Create user with basic information
- ✅ Create user with Ivorian name and phone
- ✅ Assign roles to user
- ✅ Edit existing user
- ✅ Email field disabled in edit mode
- ✅ Delete user
- ✅ Validate email format
- ✅ Validate required fields
- ✅ Handle duplicate email error
- ✅ Filter users by status
- ✅ Search users by name
- ✅ Display user avatar
- ✅ Change user status
- ✅ Cancel user creation

### Staff Management (12 tests)

- ✅ Display staff list page
- ✅ Create staff member
- ✅ Create staff with different positions
- ✅ Edit existing staff member
- ✅ User ID hidden in edit mode
- ✅ Validate hire date not in future
- ✅ Change staff status
- ✅ Delete staff member
- ✅ Validate required fields
- ✅ Filter staff by position
- ✅ Search staff by department
- ✅ Display staff member details

### Teacher Management (14 tests)

- ✅ Display teachers list page
- ✅ Create teacher
- ✅ Create teacher with multiple subjects
- ✅ Edit existing teacher
- ✅ User ID hidden in edit mode
- ✅ Validate hire date not in future
- ✅ Change teacher status
- ✅ Delete teacher
- ✅ Validate required fields
- ✅ Require at least one subject
- ✅ Filter teachers by specialization
- ✅ Search teachers by name
- ✅ Display assigned subjects
- ✅ Add and remove subjects

### Complete Workflows (7 tests)

- ✅ Complete HR setup workflow (role → user → teacher)
- ✅ Staff member complete workflow
- ✅ Role update affecting users
- ✅ User status changes
- ✅ Bulk operations
- ✅ Navigate between HR sections
- ✅ Error recovery

**Total: 61 E2E tests**

## 🏗️ Architecture

### Page Object Model

We use the Page Object Model pattern to encapsulate page interactions:

```typescript
// Example usage
const rolePage = new RoleManagementPage(page)
await rolePage.goto()
await rolePage.createRole({ name: 'Admin', scope: 'system' })
await rolePage.save()
```

### Test Data Generators

Helper functions generate realistic test data for Côte d'Ivoire context:

```typescript
generateUniqueData('Teacher') // 'Teacher-1733234567890'
generateEmail('Kouassi') // 'kouassi.1733234567890@yeko.test'
generateIvorianPhone() // '+225 07 12 34 56 78'
```

### Authentication Fixture

Tests use an authenticated page fixture that handles login automatically:

```typescript
test('my test', async ({ authenticatedPage }) => {
  // Already logged in, ready to test
})
```

## 🌍 Localization Support

Tests support both English and French UI:

- French names with accents (Aïcha, Côte d'Ivoire)
- Ivorian phone number formats (+225)
- Bilingual selectors (e.g., `/save|enregistrer/i`)

## 📊 Test Reports

After running tests, view the HTML report:

```bash
pnpm test:e2e:report
```

Reports include:

- Test results with pass/fail status
- Screenshots on failure
- Videos of failed tests
- Execution traces for debugging

## 🐛 Debugging

### Debug a specific test

```bash
pnpm test:e2e:debug role-management.e2e.test.ts
```

### View test traces

1. Run tests (traces are captured on first retry)
2. Open the report: `pnpm test:e2e:report`
3. Click on a failed test
4. Click "Trace" tab to see step-by-step execution

### Common Issues

**Tests timing out:**

- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Verify network connectivity

**Authentication failing:**

- Update credentials in `e2e/fixtures/auth.fixture.ts`
- Ensure test user exists in database
- Check auth routes are correct

**Selectors not found:**

- Run in headed mode to see what's happening
- Check if UI text matches selectors
- Verify translations are loaded

## 🔧 Configuration

Edit `playwright.config.ts` to customize:

- Base URL
- Timeouts
- Browsers to test
- Screenshot/video settings
- Parallel execution

## 📝 Writing New Tests

### 1. Create test file

```typescript
import { expect, test } from './fixtures/auth.fixture'
import { MyPage } from './helpers/page-objects'

test.describe('My Feature', () => {
  test('should do something', async ({ authenticatedPage }) => {
    // Your test code
  })
})
```

### 2. Add page object (if needed)

```typescript
export class MyPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto('/my-route')
  }
}
```

### 3. Run and debug

```bash
pnpm test:e2e:debug my-feature.e2e.test.ts
```

## 🎯 Best Practices

1. **Use Page Objects** - Encapsulate page interactions
2. **Generate Unique Data** - Avoid test conflicts
3. **Test User Behavior** - Not implementation details
4. **Keep Tests Independent** - Each test should work alone
5. **Use Descriptive Names** - Clear test descriptions
6. **Handle Async Properly** - Always await async operations
7. **Clean Up** - Tests should not leave artifacts
8. **Test Happy & Error Paths** - Both success and failure cases

## 🚦 CI/CD Integration

### GitHub Actions Example

```yaml
- name: Install Playwright
  run: pnpm exec playwright install --with-deps

- name: Run E2E tests
  run: pnpm test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

## 🤝 Contributing

When adding new E2E tests:

1. Follow existing patterns
2. Add tests to appropriate file
3. Update this README with test count
4. Ensure tests pass locally
5. Run typecheck: `pnpm typecheck`

## 📞 Support

For issues or questions:

- Check existing tests for examples
- Review Playwright documentation
- Ask the team in #testing channel
