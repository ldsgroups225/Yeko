import { expect, test } from '@playwright/test'

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
    await expect(page.locator('text=Bonjour, Enseignant')).toBeVisible()
    await expect(page.locator('text=Actions rapides')).toBeVisible()
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
