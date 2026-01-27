import { expect, test } from '@playwright/test'

test.describe('Grade Management - Scenario 2: Persistence', () => {
  test.use({ storageState: './e2e-tests/.auth/user.json' })

  test('Verify persistence of unpublished grade draft', async ({ page }) => {
    await test.step('0. Setup: Create a local grade draft', async () => {
      await page.goto('/app/schools')

      const schoolCard = page.locator('a[href*="/app/schools/"]').first()
      await expect(schoolCard).toBeVisible({ timeout: 15000 })
      await schoolCard.click()

      const classCard = page.locator('a[href*="/class/"]').first()
      await expect(classCard).toBeVisible({ timeout: 15000 })
      await classCard.click()

      await page.getByRole('button', { name: /Ajouter une note/i }).click()

      await page.locator('input#note-description-input').fill('Persistence Test Evaluation')

      const subjectSelectTrigger = page.locator('button').filter({ hasText: /Matière|Subject/i })
      if (await subjectSelectTrigger.isVisible()) {
        await subjectSelectTrigger.click()
        await page.getByRole('option').first().click()
      }

      const typeSelectTrigger = page.getByRole('combobox').first()
      await typeSelectTrigger.click()
      await page.getByRole('option', { name: /Devoir/i }).click()

      await page.locator('input[title="Barème"]').fill('20')

      const firstGradeInput = page.locator('input[placeholder="--"]').first()
      await firstGradeInput.fill('15')

      await page.getByRole('button', { name: /Enregistrer|Save/i }).click()
      await expect(page.getByText(/enregistrée localement|saved locally/i)).toBeVisible()
    })

    await test.step('1. Indicator Visibility', async () => {
      const unpublishedButton = page.getByRole('button', { name: /Note non publiée/i })
      await expect(unpublishedButton).toBeVisible({ timeout: 10000 })
      await expect(unpublishedButton).toContainText('1')
    })

    await test.step('2. Persistence: Navigate away and return', async () => {
      await page.goto('/app/schools')
      await expect(page).toHaveURL(/.*\/app\/schools/)

      const schoolCard = page.locator('a[href*="/app/schools/"]').first()
      await schoolCard.click()
      const classCard = page.locator('a[href*="/class/"]').first()
      await classCard.click()

      const unpublishedButton = page.getByRole('button', { name: /Note non publiée/i })
      await expect(unpublishedButton).toBeVisible({ timeout: 10000 })
      await expect(unpublishedButton).toContainText('1')
    })
  })
})
