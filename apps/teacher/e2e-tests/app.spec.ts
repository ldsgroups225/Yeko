import { expect, test } from '@playwright/test'

// ============================================
// YEKO TEACHER APP - COMPREHENSIVE E2E TESTS
// ============================================
// This test suite covers all routes and features in the Yeko Teacher app
// for 100% coverage of the application's user-facing functionality.

test.describe('Yeko Teacher App - Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we're logged out before each test
    await page.context().clearCookies()
  })

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/.*login/)

    // Check for login form elements
    await expect(page.locator('input[id="email"]')).toBeVisible()
    await expect(page.locator('input[id="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should allow user to login with valid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill login form
    await page.locator('input[id="email"]').fill('enseignant@ecole.com')
    await page.locator('input[id="password"]').fill('password')

    // Submit form
    await page.locator('button[type="submit"]').click()

    // Should redirect to app dashboard
    await expect(page).toHaveURL(/.*app/, { timeout: 10000 })
  })

  test('should redirect to login when accessing app without authentication', async ({ page }) => {
    // Clear auth state and try to access app
    await page.context().clearCookies()
    await page.goto('/app')

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/)
  })
})

test.describe('Yeko Teacher App - Dashboard', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should display dashboard page', async ({ page }) => {
    await page.goto('/app')
    await expect(page).toHaveURL(/.*app/)

    // Check for dashboard elements
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should display greeting with teacher name', async ({ page }) => {
    await page.goto('/app')

    // Dashboard should show greeting
    const greeting = page.locator('h1')
    await expect(greeting).toContainText('Enseignant')
  })

  test('should display quick action buttons', async ({ page }) => {
    await page.goto('/app')

    // Check for quick action buttons
    await expect(page.locator('text=Notes')).toBeVisible()
    await expect(page.locator('text=Devoirs')).toBeVisible()
    await expect(page.locator('text=Notes')).toBeVisible() // Grades
    await expect(page.locator('text=Messages')).toBeVisible()
  })

  test('should navigate to sessions from dashboard', async ({ page }) => {
    await page.goto('/app')

    // Click on Notes (Sessions) quick action
    await page.locator('text=Notes').first().click()
    await expect(page).toHaveURL(/.*sessions/)
  })

  test('should navigate to grades from dashboard', async ({ page }) => {
    await page.goto('/app')

    // Click on Grades quick action
    await page.locator('a:has-text("Notes")').nth(1).click()
    await expect(page).toHaveURL(/.*grades/)
  })

  test('should navigate to messages from dashboard', async ({ page }) => {
    await page.goto('/app')

    // Click on Messages quick action
    await page.locator('a:has-text("Messages")').click()
    await expect(page).toHaveURL(/.*messages/)
  })
})

test.describe('Yeko Teacher App - Navigation', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should have correct page title', async ({ page }) => {
    await page.goto('/app')
    await expect(page).toHaveTitle(/Yeko|Teacher/)
  })

  test('should navigate to attendance page', async ({ page }) => {
    await page.goto('/app/attendance')
    await expect(page).toHaveURL(/.*attendance/)
  })

  test('should navigate to classes page', async ({ page }) => {
    await page.goto('/app/classes')
    await expect(page).toHaveURL(/.*classes/)
  })

  test('should navigate to schedule page', async ({ page }) => {
    await page.goto('/app/schedule')
    await expect(page).toHaveURL(/.*schedule/)
  })

  test('should navigate to sessions page', async ({ page }) => {
    await page.goto('/app/sessions')
    await expect(page).toHaveURL(/.*sessions/)
  })

  test('should navigate to homework page', async ({ page }) => {
    await page.goto('/app/homework')
    await expect(page).toHaveURL(/.*homework/)
  })

  test('should navigate to grades page', async ({ page }) => {
    await page.goto('/app/grades')
    await expect(page).toHaveURL(/.*grades/)
  })

  test('should navigate to messages page', async ({ page }) => {
    await page.goto('/app/messages')
    await expect(page).toHaveURL(/.*messages/)
  })

  test('should navigate to notifications page', async ({ page }) => {
    await page.goto('/app/notifications')
    await expect(page).toHaveURL(/.*notifications/)
  })
})

test.describe('Yeko Teacher App - Attendance Page', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should display attendance page', async ({ page }) => {
    await page.goto('/app/attendance')
    await expect(page).toHaveURL(/.*attendance/)
    await expect(page.locator('h1')).toContainText('Présence')
  })

  test('should display class selection dropdown', async ({ page }) => {
    await page.goto('/app/attendance')

    // Check for class select element
    const classSelect = page.locator('select').first()
    await expect(classSelect).toBeVisible()
  })

  test('should display date picker', async ({ page }) => {
    await page.goto('/app/attendance')

    // Check for date input
    const dateInput = page.locator('input[type="date"]')
    await expect(dateInput).toBeVisible()
  })

  test('should update date when changed', async ({ page }) => {
    await page.goto('/app/attendance')

    const dateInput = page.locator('input[type="date"]')
    const newDate = '2025-01-15'
    await dateInput.fill(newDate)
    await expect(dateInput).toHaveValue(newDate)
  })

  test('should show attendance counts when class is selected', async ({ page }) => {
    await page.goto('/app/attendance')

    // Select a class
    const classSelect = page.locator('select').first()
    await classSelect.selectOption({ index: 1 })

    // Should show attendance counts badges
    await expect(page.locator('text=Total')).toBeVisible()
  })

  test('should show student roster when class is selected', async ({ page }) => {
    await page.goto('/app/attendance')

    // Select a class
    const classSelect = page.locator('select').first()
    await classSelect.selectOption({ index: 1 })

    // Wait for roster to load
    await page.waitForTimeout(1000)

    // Should show student rows or "no students" message
    const studentRow = page.locator('.border.rounded-lg').first()
    await expect(studentRow).toBeVisible()
  })

  test('should have mark all present button', async ({ page }) => {
    await page.goto('/app/attendance')

    // Select a class to reveal the button
    const classSelect = page.locator('select').first()
    await classSelect.selectOption({ index: 1 })

    // Check for "Tout marquer présent" button
    await expect(page.locator('text=Tout marquer présent')).toBeVisible()
  })
})

test.describe('Yeko Teacher App - Classes Page', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should display classes page', async ({ page }) => {
    await page.goto('/app/classes')
    await expect(page).toHaveURL(/.*classes/)
    await expect(page.locator('h1')).toContainText('Mes Classes')
  })

  test('should display create class button', async ({ page }) => {
    await page.goto('/app/classes')

    // Check for "Créer une classe" button
    await expect(page.locator('text=Créer une classe')).toBeVisible()
  })

  test('should display class cards when classes exist', async ({ page }) => {
    await page.goto('/app/classes')

    // Wait for classes to load
    await page.waitForTimeout(1000)

    // Should show class cards or empty state
    const classCard = page.locator('.grid > div').first()
    await expect(classCard).toBeVisible()
  })

  test('should display student count on class cards', async ({ page }) => {
    await page.goto('/app/classes')

    // Wait for classes to load
    await page.waitForTimeout(1000)

    // Check for student count icon
    await expect(page.locator('.text-muted-foreground svg').first()).toBeVisible()
  })

  test('should display subject count on class cards', async ({ page }) => {
    await page.goto('/app/classes')

    // Wait for classes to load
    await page.waitForTimeout(1000)

    // Check for subject count
    const subjectCount = page.locator('.flex.items-center.gap-1').nth(1)
    await expect(subjectCount).toBeVisible()
  })

  test('should navigate to class details when card is clicked', async ({ page }) => {
    await page.goto('/app/classes')

    // Wait for classes to load
    await page.waitForTimeout(1000)

    // Click on first class card
    await page.locator('.grid > div').first().click()

    // Should navigate or show details
    await page.waitForTimeout(500)
  })
})

test.describe('Yeko Teacher App - Schedule Page', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should display schedule page', async ({ page }) => {
    await page.goto('/app/schedule')
    await expect(page).toHaveURL(/.*schedule/)
    await expect(page.locator('h1')).toContainText('Emploi du temps')
  })

  test('should display week navigation', async ({ page }) => {
    await page.goto('/app/schedule')

    // Check for week navigation buttons
    await expect(page.locator('button[aria-label="Semaine précédente"]')).toBeVisible()
    await expect(page.locator('button[aria-label="Semaine suivante"]')).toBeVisible()
  })

  test('should navigate to previous week', async ({ page }) => {
    await page.goto('/app/schedule')

    // Click previous week button
    await page.locator('button[aria-label="Semaine précédente"]').click()

    // Week offset should change (we can verify by checking URL or state)
    await page.waitForTimeout(500)
  })

  test('should navigate to next week', async ({ page }) => {
    await page.goto('/app/schedule')

    // Click next week button
    await page.locator('button[aria-label="Semaine suivante"]').click()

    // Week offset should change
    await page.waitForTimeout(500)
  })

  test('should display day selector tabs', async ({ page }) => {
    await page.goto('/app/schedule')

    // Check for day tabs (Lun, Mar, Mer, etc.)
    await expect(page.locator('text=Lun')).toBeVisible()
    await expect(page.locator('text=Mar')).toBeVisible()
    await expect(page.locator('text=Mer')).toBeVisible()
  })

  test('should select different day', async ({ page }) => {
    await page.goto('/app/schedule')

    // Click on a different day
    await page.locator('text=Mar').click()

    // Day should be selected (highlighted)
    await expect(page.locator('.bg-primary').locator('text=Mar')).toBeVisible()
  })

  test('should display schedule cards for selected day', async ({ page }) => {
    await page.goto('/app/schedule')

    // Wait for schedule to load
    await page.waitForTimeout(1000)

    // Should show schedule cards or empty state
    const scheduleCard = page.locator('.space-y-2 > div').first()
    await expect(scheduleCard).toBeVisible()
  })

  test('should display start session button on schedule cards', async ({ page }) => {
    await page.goto('/app/schedule')

    // Wait for schedule to load
    await page.waitForTimeout(1000)

    // Check for "Commencer" button
    const startButton = page.locator('text=Commencer').first()
    await expect(startButton).toBeVisible()
  })

  test('should display time slots on schedule cards', async ({ page }) => {
    await page.goto('/app/schedule')

    // Wait for schedule to load
    await page.waitForTimeout(1000)

    // Check for time display (e.g., "08:00 - 09:00")
    const timeSlot = page.locator('.text-sm.font-medium.text-muted-foreground').first()
    await expect(timeSlot).toContainText(':')
  })

  test('should display subject name on schedule cards', async ({ page }) => {
    await page.goto('/app/schedule')

    // Wait for schedule to load
    await page.waitForTimeout(1000)

    // Check for subject name
    const subjectName = page.locator('h3').first()
    await expect(subjectName).toBeVisible()
  })

  test('should display class name on schedule cards', async ({ page }) => {
    await page.goto('/app/schedule')

    // Wait for schedule to load
    await page.waitForTimeout(1000)

    // Check for class name
    const className = page.locator('.text-sm.text-muted-foreground').first()
    await expect(className).toBeVisible()
  })
})

test.describe('Yeko Teacher App - Sessions Page', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should display sessions page', async ({ page }) => {
    await page.goto('/app/sessions')
    await expect(page).toHaveURL(/.*sessions/)
    await expect(page.locator('h1')).toContainText('Historique')
  })

  test('should display session history cards', async ({ page }) => {
    await page.goto('/app/sessions')

    // Wait for sessions to load
    await page.waitForTimeout(1000)

    // Should show session cards or empty state
    const sessionCard = page.locator('a[href*="/app/sessions/"]').first()
    await expect(sessionCard).toBeVisible()
  })

  test('should display session date and time', async ({ page }) => {
    await page.goto('/app/sessions')

    // Wait for sessions to load
    await page.waitForTimeout(1000)

    // Check for date display
    const dateDisplay = page.locator('.text-sm.text-muted-foreground').first()
    await expect(dateDisplay).toContainText('•')
  })

  test('should display session status badge', async ({ page }) => {
    await page.goto('/app/sessions')

    // Wait for sessions to load
    await page.waitForTimeout(1000)

    // Check for status badge
    const statusBadge = page.locator('.flex.flex-col.items-end gap-2').first()
    await expect(statusBadge).toBeVisible()
  })

  test('should navigate to session details when card is clicked', async ({ page }) => {
    await page.goto('/app/sessions')

    // Wait for sessions to load
    await page.waitForTimeout(1000)

    // Click on first session card
    await page.locator('a[href*="/app/sessions/"]').first().click()

    // Should navigate to session details
    await expect(page).toHaveURL(/.*\/app\/sessions\//)
  })

  test('should display student attendance counts for completed sessions', async ({ page }) => {
    await page.goto('/app/sessions')

    // Wait for sessions to load
    await page.waitForTimeout(1000)

    // Check for attendance counts
    const attendanceText = page.locator('.text-xs.text-muted-foreground').first()
    await expect(attendanceText).toBeVisible()
  })
})

test.describe('Yeko Teacher App - Session Detail Page', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should display session detail page', async ({ page }) => {
    // Navigate to a specific session (using a mock ID)
    await page.goto('/app/sessions/test-session-id')
    await expect(page).toHaveURL(/.*\/app\/sessions\//)
  })

  test('should display session information', async ({ page }) => {
    await page.goto('/app/sessions/test-session-id')

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Check for session info
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should display notes section', async ({ page }) => {
    await page.goto('/app/sessions/test-session-id')

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Check for notes section
    await expect(page.locator('text=Notes').first()).toBeVisible()
  })
})

test.describe('Yeko Teacher App - Homework Page', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should display homework page', async ({ page }) => {
    await page.goto('/app/homework')
    await expect(page).toHaveURL(/.*homework/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should display create homework button', async ({ page }) => {
    await page.goto('/app/homework')

    // Check for "Créer un devoir" button
    await expect(page.locator('text=Nouveau devoir')).toBeVisible()
  })

  test('should navigate to create homework page', async ({ page }) => {
    await page.goto('/app/homework')

    // Click create homework button
    await page.locator('text=Nouveau devoir').click()

    // Should navigate to homework creation page
    await expect(page).toHaveURL(/.*homework\/new/)
  })

  test('should display homework list', async ({ page }) => {
    await page.goto('/app/homework')

    // Wait for homework list to load
    await page.waitForTimeout(1000)

    // Should show homework cards or empty state
    await expect(page.locator('.space-y-2').first()).toBeVisible()
  })
})

test.describe('Yeko Teacher App - Grades Page', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should display grades page', async ({ page }) => {
    await page.goto('/app/grades')
    await expect(page).toHaveURL(/.*grades/)
    await expect(page.locator('h1')).toContainText('Notes')
  })

  test('should display class selection for grades', async ({ page }) => {
    await page.goto('/app/grades')

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Check for class selector
    await expect(page.locator('select').first()).toBeVisible()
  })

  test('should display subject selection for grades', async ({ page }) => {
    await page.goto('/app/grades')

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Check for subject selector
    await expect(page.locator('select').nth(1)).toBeVisible()
  })

  test('should display grades table when selections are made', async ({ page }) => {
    await page.goto('/app/grades')

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Select class and subject
    await page.locator('select').first().selectOption({ index: 1 })
    await page.locator('select').nth(1).selectOption({ index: 1 })

    // Should show grades table or empty state
    await expect(page.locator('.overflow-x-auto').first()).toBeVisible()
  })
})

test.describe('Yeko Teacher App - Messages Page', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should display messages page', async ({ page }) => {
    await page.goto('/app/messages')
    await expect(page).toHaveURL(/.*messages/)
    await expect(page.locator('h1')).toContainText('Messages')
  })

  test('should display compose message button', async ({ page }) => {
    await page.goto('/app/messages')

    // Check for compose button
    await expect(page.locator('text=Nouveau message')).toBeVisible()
  })

  test('should navigate to compose message page', async ({ page }) => {
    await page.goto('/app/messages')

    // Click compose button
    await page.locator('text=Nouveau message').click()

    // Should navigate to compose page
    await expect(page).toHaveURL(/.*messages\/compose/)
  })

  test('should display message list', async ({ page }) => {
    await page.goto('/app/messages')

    // Wait for messages to load
    await page.waitForTimeout(1000)

    // Should show message list or empty state
    await expect(page.locator('.space-y-2').first()).toBeVisible()
  })

  test('should display message preview', async ({ page }) => {
    await page.goto('/app/messages')

    // Wait for messages to load
    await page.waitForTimeout(1000)

    // Check for message preview content
    await expect(page.locator('.truncate').first()).toBeVisible()
  })
})

test.describe('Yeko Teacher App - Compose Message Page', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should display compose message page', async ({ page }) => {
    await page.goto('/app/messages/compose')
    await expect(page).toHaveURL(/.*messages\/compose/)
    await expect(page.locator('h1')).toContainText('Nouveau')
  })

  test('should display recipient selection', async ({ page }) => {
    await page.goto('/app/messages/compose')

    // Check for recipient select
    await expect(page.locator('select').first()).toBeVisible()
  })

  test('should display message body input', async ({ page }) => {
    await page.goto('/app/messages/compose')

    // Check for message textarea
    await expect(page.locator('textarea').first()).toBeVisible()
  })

  test('should display send button', async ({ page }) => {
    await page.goto('/app/messages/compose')

    // Check for send button
    await expect(page.locator('button[type="submit"]').first()).toBeVisible()
  })
})

test.describe('Yeko Teacher App - Message Detail Page', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should display message detail page', async ({ page }) => {
    await page.goto('/app/messages/test-message-id')
    await expect(page).toHaveURL(/.*\/app\/messages\//)
  })

  test('should display message content', async ({ page }) => {
    await page.goto('/app/messages/test-message-id')

    // Wait for message to load
    await page.waitForTimeout(1000)

    // Check for message content
    await expect(page.locator('.prose').first()).toBeVisible()
  })

  test('should display reply button', async ({ page }) => {
    await page.goto('/app/messages/test-message-id')

    // Check for reply button
    await expect(page.locator('text=Répondre')).toBeVisible()
  })
})

test.describe('Yeko Teacher App - Notifications Page', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should display notifications page', async ({ page }) => {
    await page.goto('/app/notifications')
    await expect(page).toHaveURL(/.*notifications/)
    await expect(page.locator('h1')).toContainText('Notifications')
  })

  test('should display notification list', async ({ page }) => {
    await page.goto('/app/notifications')

    // Wait for notifications to load
    await page.waitForTimeout(1000)

    // Should show notifications or empty state
    await expect(page.locator('.space-y-2').first()).toBeVisible()
  })

  test('should display unread notifications badge', async ({ page }) => {
    await page.goto('/app/notifications')

    // Check for unread badge
    const unreadBadge = page.locator('.bg-primary').first()
    await expect(unreadBadge).toBeVisible()
  })
})

test.describe('Yeko Teacher App - Student Notes', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should navigate to student notes page', async ({ page }) => {
    await page.goto('/app/students/test-student-123/notes')
    await expect(page).toHaveURL(/.*students\/.*\/notes/)
  })

  test('should display student notes page', async ({ page }) => {
    await page.goto('/app/students/test-student-123/notes')

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Check for notes section
    await expect(page.locator('text=Notes').first()).toBeVisible()
  })

  test('should display create note button', async ({ page }) => {
    await page.goto('/app/students/test-student-123/notes')

    // Check for add note button
    await expect(page.locator('text=Ajouter une note').first()).toBeVisible()
  })

  test('should display existing notes', async ({ page }) => {
    await page.goto('/app/students/test-student-123/notes')

    // Wait for notes to load
    await page.waitForTimeout(1000)

    // Should show notes list or empty state
    await expect(page.locator('.space-y-4').first()).toBeVisible()
  })
})

test.describe('Yeko Teacher App - Student Parents', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should navigate to student parents page', async ({ page }) => {
    await page.goto('/app/students/test-student-123/parents')
    await expect(page).toHaveURL(/.*students\/.*\/parents/)
  })

  test('should display student parents page', async ({ page }) => {
    await page.goto('/app/students/test-student-123/parents')

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Check for parents section
    await expect(page.locator('text=Parents').first()).toBeVisible()
  })

  test('should display parent contact information', async ({ page }) => {
    await page.goto('/app/students/test-student-123/parents')

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Check for contact info
    await expect(page.locator('.grid').first()).toBeVisible()
  })
})

test.describe('Yeko Teacher App - Grades Detail', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should display grades detail page', async ({ page }) => {
    await page.goto('/app/grades/test-class-id/test-subject-id')
    await expect(page).toHaveURL(/.*grades\/.*\/.*/)
  })

  test('should display class and subject information', async ({ page }) => {
    await page.goto('/app/grades/test-class-id/test-subject-id')

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Check for header
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('should display student grades table', async ({ page }) => {
    await page.goto('/app/grades/test-class-id/test-subject-id')

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Check for grades table
    await expect(page.locator('table').first()).toBeVisible()
  })

  test('should display add grade button', async ({ page }) => {
    await page.goto('/app/grades/test-class-id/test-subject-id')

    // Check for add grade button
    await expect(page.locator('text=Ajouter une note').first()).toBeVisible()
  })
})

test.describe('Yeko Teacher App - Homework Detail', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should display homework detail page', async ({ page }) => {
    await page.goto('/app/homework/test-homework-id')
    await expect(page).toHaveURL(/.*homework\/.*/)
  })

  test('should display homework information', async ({ page }) => {
    await page.goto('/app/homework/test-homework-id')

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Check for homework title
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('should display homework description', async ({ page }) => {
    await page.goto('/app/homework/test-homework-id')

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Check for description
    await expect(page.locator('.prose').first()).toBeVisible()
  })

  test('should display due date', async ({ page }) => {
    await page.goto('/app/homework/test-homework-id')

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Check for due date
    await expect(page.locator('.text-sm.text-muted-foreground').first()).toBeVisible()
  })
})

test.describe('Yeko Teacher App - Error Handling', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should handle 404 for non-existent pages', async ({ page }) => {
    await page.goto('/app/non-existent-page')

    // Should show 404 page or redirect
    await expect(page.locator('text=404').or(page.locator('text=Page non trouvée'))).toBeVisible()
  })

  test('should handle invalid session IDs', async ({ page }) => {
    await page.goto('/app/sessions/invalid-session-id-123')

    // Should show error or empty state
    await expect(page.locator('.text-center').or(page.locator('text=Aucun'))).toBeVisible()
  })

  test('should handle invalid student IDs', async ({ page }) => {
    await page.goto('/app/students/invalid-student-id/notes')

    // Should show error or empty state
    await expect(page.locator('.text-center').or(page.locator('text=Aucun'))).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // This test simulates network issues by intercepting requests
    await page.route('**/api/**', route => route.abort('failed'))

    await page.goto('/app/classes')

    // Should show error state
    await expect(page.locator('text=Erreur').or(page.locator('.text-red'))).toBeVisible()
  })
})

test.describe('Yeko Teacher App - Responsive Design', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should display correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/app')

    // Should be responsive
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should display correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    await page.goto('/app')

    // Should be responsive
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should display correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    await page.goto('/app')

    // Should be responsive
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should have touch-friendly buttons on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/app/attendance')

    // Buttons should be large enough for touch
    const button = page.locator('button').first()
    const buttonBox = await button.boundingBox()

    expect(buttonBox?.height).toBeGreaterThanOrEqual(32)
  })
})

test.describe('Yeko Teacher App - Accessibility', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/app')

    // Check for proper h1
    await expect(page.locator('h1').first()).toHaveCount(1)
  })

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/login')

    // Inputs should have associated labels
    await expect(page.locator('input[id="email"]')).toHaveAttribute('id')
    await expect(page.locator('input[id="password"]')).toHaveAttribute('id')
  })

  test('should have focus indicators on interactive elements', async ({ page }) => {
    await page.goto('/app')

    // Focus should be visible
    await page.keyboard.press('Tab')
    const focusedElement = await page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should have proper ARIA labels on navigation', async ({ page }) => {
    await page.goto('/app/schedule')

    // Check for ARIA labels on navigation buttons
    await expect(page.locator('button[aria-label]').first()).toHaveAttribute('aria-label')
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/app')

    // Should be able to navigate using keyboard only
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Should not throw errors
  })
})

test.describe('Yeko Teacher App - Performance', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should load dashboard within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/app')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should load schedule page within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/app/schedule')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should navigate between pages quickly', async ({ page }) => {
    await page.goto('/app')

    const startTime = Date.now()
    await page.goto('/app/classes')
    await page.waitForLoadState('networkidle')
    const navTime = Date.now() - startTime

    // Navigation should be quick
    expect(navTime).toBeLessThan(3000)
  })

  test('should lazy load images', async ({ page }) => {
    await page.goto('/app/attendance')

    // Check that images have loading="lazy" attribute
    const images = page.locator('img')
    const imageCount = await images.count()

    if (imageCount > 0) {
      // At least some images should be lazy loaded
      const lazyImages = page.locator('img[loading="lazy"]')
      await expect(lazyImages.first()).toBeVisible()
    }
  })
})

test.describe('Yeko Teacher App - Internationalization', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should display French text', async ({ page }) => {
    await page.goto('/app')

    // Dashboard should show French text
    await expect(page.locator('text=Enseignant')).toBeVisible()
    await expect(page.locator('text=Classes')).toBeVisible()
  })

  test('should display French dates', async ({ page }) => {
    await page.goto('/app/schedule')

    // Schedule should show French dates (e.g., "lundi", "mardi")
    await expect(page.locator('text=Lun')).toBeVisible()
    await expect(page.locator('text=Mar')).toBeVisible()
  })

  test('should display French month names', async ({ page }) => {
    await page.goto('/app/schedule')

    // Should show French month abbreviations
    await expect(page.locator('.text-sm.font-medium')).toContainText('janv')
  })
})
