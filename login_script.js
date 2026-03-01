import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const context = await browser.newContext()
  const page = await context.newPage()
  page.setDefaultTimeout(60000)

  page.on('console', (msg) => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`)
  })

  page.on('pageerror', (err) => {
    console.log('[BROWSER UNCAUGHT EXCEPTION]', err.message)
  })

  page.on('requestfailed', (request) => {
    console.log(`[BROWSER REQUEST FAILED] ${request.method()} ${request.url()} - ${request.failure()?.errorText}`)
  })

  page.on('response', (response) => {
    if (response.status() >= 400) {
      console.log(`[BROWSER RESPONSE ERROR] ${response.status()} ${response.url()}`)
    }
  })

  try {
    console.log('Clearing cookies for a fresh session...')
    await context.clearCookies()

    console.log('Navigating to http://localhost:3001/accounting/dashboard...')
    await page.goto('http://localhost:3001/accounting/dashboard')

    // Explicitly wait for the login form to appear
    console.log('Waiting for login form...')
    const emailField = page.locator('input[type="email"]')
    await emailField.waitFor({ state: 'visible', timeout: 30000 })

    console.log('Filling credentials...')
    await emailField.fill('yvesroland@julesverne.edu')
    await page.fill('input[type="password"]', 'Aazzeerrtt88')

    console.log('Submitting login...')
    await page.click('button[type="submit"]')

    console.log('Waiting for URL to change to dashboard...')
    await page.waitForURL('**/dashboard', { timeout: 60000 })

    console.log('Waiting for dashboard content...')
    await page.waitForLoadState('networkidle')

    console.log('Staying on dashboard for 15 seconds to capture logs...')
    await page.waitForTimeout(15000)

    console.log('Final URL:', page.url())
    await page.screenshot({ path: 'dashboard-fresh-audit.png' })
  }
  catch (err) {
    console.error('Script error:', err)
    await page.screenshot({ path: 'audit-error.png' })
  }
  finally {
    await browser.close()
  }
})()
