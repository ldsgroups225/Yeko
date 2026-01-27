import { expect, test } from '@playwright/test'

// ============================================
// SESSION FLOW E2E TESTS
// ============================================

test.describe('Class Session Flow', () => {
  test.use({ storageState: 'e2e-tests/.auth/user.json' })

  test('should complete a full class session workflow', async ({ page }) => {
    // 1. Navigate to Classes and open the first class
    await page.goto('/app/classes')
    await page.waitForLoadState('networkidle')

    // Wait for classes to load and click the first one
    const firstClassCard = page.locator('.grid > a').first() // Assuming Link wraps the card
    await expect(firstClassCard).toBeVisible({ timeout: 10000 })
    await firstClassCard.click()

    // 2. Start Session
    // Wait for "Commencer le cours" button
    const startButton = page.getByRole('button', { name: 'Commencer le cours' })
    // Fallback if i18n is different or strict match fails
    await expect(startButton).toBeVisible()
    await startButton.click()

    // 3. Attendance Mode (Initial)
    // Check if SessionStatsPanel is visible
    await expect(page.locator('text=Présents')).toBeVisible() // "Présents" stat
    await expect(page.locator('text=Absents')).toBeVisible()

    // Mark a student as absent (if any student exists)
    // We assume at least one student.
    // Find the first student card (AttendanceStudentCard)
    // In session mode, standard view is hidden, session view is shown.
    // AttendanceStudentCard has "Présent", "Absent", "Retard" buttons or toggles.
    // Based on implementation, it's likely segmented control or buttons.
    // Let's assume we just click "Terminer l'appel" directly to test happy path first.

    // Click "Terminer l'appel"
    const finishRollCallBtn = page.getByRole('button', { name: 'Terminer l\'appel' })
    await finishRollCallBtn.click()

    // 4. Transition Logic
    // If no one absent, it goes to Participation.
    // If someone absent, it goes to Attendance Late.
    // Since we didn't mark anyone absent (default is all present), it should go to Participation.

    // Verify Participation Mode
    // Check for "Passer à la participation" button OR "Finaliser" button (Attendance Late vs Participation)
    // If we are in Participation, main action is "Finaliser".
    await expect(page.getByRole('button', { name: 'Finaliser' })).toBeVisible()

    // Toggle participation for a student (if possible)
    const participationCard = page.locator('.cursor-pointer').first() // Participation cards are clickable
    if (await participationCard.isVisible()) {
      await participationCard.click()
    }

    // 5. Finalize Session
    await page.getByRole('button', { name: 'Finaliser' }).click()

    // 6. Finalization Sheet
    // Check for sheet content
    await expect(page.locator('text=Résumé de la session')).toBeVisible()

    // Confirm finalization (Submit)
    // There are two "Finaliser" buttons: one in main panel (clicked above), one in sheet.
    // The sheet one is the submit button.
    const submitButton = page.locator('div[role="dialog"] button:has-text("Finaliser")')
    await expect(submitButton).toBeVisible()
    await submitButton.click()

    // 7. Verify Completion
    // Should return to normal view (Start button visible again)
    await expect(startButton).toBeVisible()
    await expect(page.locator('text=Résumé de la session')).not.toBeVisible()
  })
})
