import { expect, test } from '@playwright/test'

test.describe('Grade Management - Scenario 1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/schools')
  })

  test('Navigate to class and create a grade draft', async ({ page }) => {
    await test.step('1. Navigate to Schools list', async () => {
      await expect(page).toHaveURL(/.*\/app\/schools/)
      await expect(page.locator('h1')).toContainText(/Établissements|Ecoles|Schools|École/i, { timeout: 15000 })
    })

    await test.step('2. Select a specific School', async () => {
      // Wait for schools to load
      const schoolCard = page.locator('a[href*="/app/schools/"]').first()
      await expect(schoolCard).toBeVisible({ timeout: 15000 })
      await schoolCard.click()
      await expect(page).toHaveURL(/.*\/app\/schools\/.*\/classes/)
    })

    await test.step('3. Select a Classroom', async () => {
      const classCard = page.locator('a[href*="/class/"]').first()
      await expect(classCard).toBeVisible()
      await classCard.click()
      await expect(page).toHaveURL(/.*\/app\/schools\/.*\/class\/.*/)
      await expect(page.locator('h1')).toBeVisible()
    })

    await test.step('4. Click "Ajouter une note"', async () => {
      await page.getByRole('button', { name: /Ajouter une note/i }).click()
      await expect(page.getByRole('button', { name: /Enregistrer|Save/i })).toBeVisible()
    })

    await test.step('5. Fill in grade details', async () => {
      await page.locator('input#note-description-input').fill('Test E2E Evaluation')

      const subjectSelectTrigger = page.locator('button').filter({ hasText: /Matière|Subject/i })
      if (await subjectSelectTrigger.isVisible()) {
        await subjectSelectTrigger.click()
        await page.getByRole('option').first().click()
      }

      const typeSelectTrigger = page.getByRole('combobox').first()
      await typeSelectTrigger.click()
      await page.getByRole('option', { name: /Devoir/i }).click()

      await page.locator('input[title="Barème"]').fill('20')
    })

    await test.step('6. Enter grade for at least one student', async () => {
      const firstGradeInput = page.locator('input[placeholder="--"]').first()
      await expect(firstGradeInput).toBeVisible()
      await firstGradeInput.fill('15')
    })

    await test.step('7. Click "Enregistrer"', async () => {
      await page.getByRole('button', { name: /Enregistrer|Save/i }).click()
    })

    await test.step('8. Verify toast or form close', async () => {
      await expect(page.getByText(/enregistrée localement|saved locally/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /Enregistrer|Save/i })).not.toBeVisible()
    })
  })
})
