import { chromium, expect } from '@playwright/test'

const AUTH_FILE = 'e2e-tests/.auth/user.json'

async function globalSetup() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  await page.goto('http://localhost:3002/login')
  await page.waitForURL('http://localhost:3002/login')
  await page.waitForLoadState('networkidle')

  await page.getByRole('textbox', { name: 'Email' }).fill('enseignant@ecole.com')
  await page.getByRole('textbox', { name: 'Mot de passe' }).fill('password')

  await page.getByRole('button', { name: 'Se connecter' }).click()

  await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })

  await page.context().storageState({ path: AUTH_FILE })
  await browser.close()
}

export default globalSetup
