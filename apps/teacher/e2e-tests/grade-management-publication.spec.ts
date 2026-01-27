import { expect, test } from '@playwright/test'

test.describe('Grade Management - Scenario 3: Publication', () => {
  test.use({ storageState: './e2e-tests/.auth/user.json' })

  test('Create a draft and publish it', async ({ page }) => {
    await test.step('1. Navigate to classroom', async () => {
      await page.goto('/app/schools')
      await expect(page).toHaveURL(/.*\/app\/schools/)

      const schoolCard = page.locator('a[href*="/app/schools/"]').first()
      await expect(schoolCard).toBeVisible({ timeout: 15000 })
      await schoolCard.click()

      const classCard = page.locator('a[href*="/class/"]').first()
      await expect(classCard).toBeVisible({ timeout: 15000 })
      await classCard.click()
      await expect(page.locator('h1')).toBeVisible()
    })

    await test.step('2. Create a grade draft', async () => {
      await page.getByRole('button', { name: /Ajouter une note/i }).click()
      await page.locator('input#note-description-input').fill('Test E2E Publication')

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

    await test.step('3. Initiate Publication', async () => {
      const unpublishedButton = page.getByRole('button', { name: /Note non publiée/i })
      await expect(unpublishedButton).toBeVisible()
      await unpublishedButton.click()

      await expect(page.getByText(/Notes en attente de publication/i)).toBeVisible()

      const publishButton = page.getByRole('button', { name: /Publier la note/i })
      await expect(publishButton).toBeVisible()
    })

    await test.step('4. Execute Publish (with confirmation)', async () => {
      await page.getByRole('button', { name: /Publier la note/i }).click()

      const confirmButton = page.getByRole('button', { name: /Publier quand même/i })
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }

      await expect(page.getByText(/Note publiée avec succès !/i)).toBeVisible()

      await expect(page.getByRole('button', { name: /Note non publiée/i })).not.toBeVisible()

      await expect(page.getByText('Test E2E Publication')).toBeVisible()
    })
  })
})
