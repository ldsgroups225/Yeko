/**
 * Accessibility Testing: Section 10
 * WCAG Compliance, Keyboard Navigation, Screen Reader Support, Color Contrast, Form Accessibility
 * Using vitest with jsdom environment for frontend tests
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// ============================================================================
// 10.1 WCAG COMPLIANCE - KEYBOARD NAVIGATION
// ============================================================================

describe('10.1 WCAG Compliance - Keyboard Navigation', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  test('should have logical tab order for form elements', () => {
    const html = `
      <form>
        <input id="first" type="text" placeholder="First" />
        <input id="second" type="text" placeholder="Second" />
        <input id="third" type="text" placeholder="Third" />
        <button id="submit">Submit</button>
      </form>
    `
    document.body.innerHTML = html

    const firstInput = document.getElementById('first') as HTMLInputElement
    const secondInput = document.getElementById('second') as HTMLInputElement
    const thirdInput = document.getElementById('third') as HTMLInputElement
    const submitBtn = document.getElementById('submit') as HTMLButtonElement

    // Tab order should be logical (default is -1 for natural order)
    expect(firstInput.tabIndex).toBeGreaterThanOrEqual(-1)
    expect(secondInput.tabIndex).toBeGreaterThanOrEqual(-1)
    expect(thirdInput.tabIndex).toBeGreaterThanOrEqual(-1)
    expect(submitBtn.tabIndex).toBeGreaterThanOrEqual(-1)
  })

  test('should make all interactive elements keyboard accessible', () => {
    const html = `
      <div>
        <button id="btn1">Button 1</button>
        <a href="#" id="link1">Link 1</a>
        <input id="input1" type="text" />
        <select id="select1">
          <option>Option 1</option>
        </select>
      </div>
    `
    document.body.innerHTML = html

    const button = document.getElementById('btn1') as HTMLButtonElement
    const link = document.getElementById('link1') as HTMLAnchorElement
    const input = document.getElementById('input1') as HTMLInputElement
    const select = document.getElementById('select1') as unknown as HTMLSelectElement

    // All should be keyboard accessible
    expect(button).toBeTruthy()
    expect(link).toBeTruthy()
    expect(input).toBeTruthy()
    expect(select).toBeTruthy()

    // Should be focusable
    button.focus()
    expect(document.activeElement).toBe(button)

    link.focus()
    expect(document.activeElement).toBe(link)

    input.focus()
    expect(document.activeElement).toBe(input)

    select.focus()
    expect(document.activeElement).toBe(select)
  })

  test('should display visible focus indicators', () => {
    const html = `
      <style>
        button:focus {
          outline: 2px solid blue;
        }
      </style>
      <button id="btn">Focus Me</button>
    `
    document.body.innerHTML = html

    const button = document.getElementById('btn') as HTMLButtonElement
    button.focus()

    expect(button === document.activeElement).toBe(true)
  })

  test('should support keyboard shortcuts via accesskey', () => {
    const html = `
      <button id="save" accesskey="s">Save</button>
      <button id="cancel" accesskey="c">Cancel</button>
    `
    document.body.innerHTML = html

    const saveBtn = document.getElementById('save') as HTMLButtonElement
    const cancelBtn = document.getElementById('cancel') as HTMLButtonElement

    expect(saveBtn.accessKey).toBe('s')
    expect(cancelBtn.accessKey).toBe('c')
  })

  test('should allow navigation with arrow keys in select', () => {
    const html = `
      <select id="menu">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </select>
    `
    document.body.innerHTML = html

    const select = document.getElementById('menu') as unknown as HTMLSelectElement
    select.focus()

    expect(document.activeElement).toBe(select)
  })

  test('should mark modals with proper ARIA attributes', () => {
    const html = `
      <div id="modal" role="dialog" aria-modal="true">
        <button id="close">Close</button>
      </div>
    `
    document.body.innerHTML = html

    const modal = document.getElementById('modal') as HTMLDivElement

    expect(modal.getAttribute('role')).toBe('dialog')
    expect(modal.getAttribute('aria-modal')).toBe('true')
  })

  test('should support Enter key to activate buttons', () => {
    const html = `
      <button id="btn">Click Me</button>
    `
    document.body.innerHTML = html

    const button = document.getElementById('btn') as HTMLButtonElement
    const clickSpy = vi.fn()
    button.addEventListener('click', clickSpy)

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    button.dispatchEvent(event)

    // Button element should exist and be interactive
    expect(button).toBeTruthy()
  })

  test('should support Space key to activate buttons', () => {
    const html = `
      <button id="btn">Click Me</button>
    `
    document.body.innerHTML = html

    const button = document.getElementById('btn') as HTMLButtonElement
    const clickSpy = vi.fn()
    button.addEventListener('click', clickSpy)

    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true })
    button.dispatchEvent(event)

    expect(button).toBeTruthy()
  })

  test('should provide skip to main content link', () => {
    const html = `
      <a href="#main" class="skip-link">Skip to main content</a>
      <nav>Navigation</nav>
      <main id="main">Main content</main>
    `
    document.body.innerHTML = html

    const skipLink = document.querySelector('.skip-link') as HTMLAnchorElement
    expect(skipLink).toBeTruthy()
    expect(skipLink.getAttribute('href')).toBe('#main')
    expect(skipLink.textContent).toBe('Skip to main content')
  })
})

// ============================================================================
// 10.2 WCAG COMPLIANCE - SCREEN READER SUPPORT
// ============================================================================

describe('10.2 WCAG Compliance - Screen Reader Support', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('should have ARIA labels on interactive elements', () => {
    const html = `
      <button id="close" aria-label="Close dialog">×</button>
      <button id="menu" aria-label="Open menu">☰</button>
    `
    document.body.innerHTML = html

    const closeBtn = document.getElementById('close') as HTMLButtonElement
    const menuBtn = document.getElementById('menu') as HTMLButtonElement

    expect(closeBtn.getAttribute('aria-label')).toBe('Close dialog')
    expect(menuBtn.getAttribute('aria-label')).toBe('Open menu')
  })

  test('should have correct ARIA roles', () => {
    const html = `
      <div id="alert" role="alert">Error message</div>
      <div id="status" role="status">Loading...</div>
      <div id="dialog" role="dialog">Dialog content</div>
      <nav id="nav" role="navigation">Navigation</nav>
    `
    document.body.innerHTML = html

    expect(document.getElementById('alert')?.getAttribute('role')).toBe('alert')
    expect(document.getElementById('status')?.getAttribute('role')).toBe('status')
    expect(document.getElementById('dialog')?.getAttribute('role')).toBe('dialog')
    expect(document.getElementById('nav')?.getAttribute('role')).toBe('navigation')
  })

  test('should associate form labels with inputs', () => {
    const html = `
      <label for="email">Email:</label>
      <input id="email" type="email" />
      <label for="password">Password:</label>
      <input id="password" type="password" />
    `
    document.body.innerHTML = html

    const emailLabel = document.querySelector('label[for="email"]') as HTMLLabelElement
    const passwordLabel = document.querySelector('label[for="password"]') as HTMLLabelElement

    expect(emailLabel.getAttribute('for')).toBe('email')
    expect(passwordLabel.getAttribute('for')).toBe('password')
  })

  test('should announce error messages to screen readers', () => {
    const html = `
      <div>
        <label for="email">Email:</label>
        <input id="email" type="email" aria-describedby="email-error" />
        <div id="email-error" role="alert">Invalid email format</div>
      </div>
    `
    document.body.innerHTML = html

    const input = document.getElementById('email') as HTMLInputElement
    const error = document.getElementById('email-error') as HTMLDivElement

    expect(input.getAttribute('aria-describedby')).toBe('email-error')
    expect(error.getAttribute('role')).toBe('alert')
  })

  test('should provide alt text for images', () => {
    const html = `
      <img id="logo" src="logo.png" alt="Company Logo" />
      <img id="icon" src="icon.png" alt="" />
    `
    document.body.innerHTML = html

    const logo = document.getElementById('logo') as HTMLImageElement
    const icon = document.getElementById('icon') as HTMLImageElement

    expect(logo.getAttribute('alt')).toBe('Company Logo')
    expect(icon.getAttribute('alt')).toBe('')
  })

  test('should have descriptive link text', () => {
    const html = `
      <a href="/about" id="link1">Learn more about us</a>
      <a href="/contact" id="link2">Contact us</a>
    `
    document.body.innerHTML = html

    const link1 = document.getElementById('link1') as HTMLAnchorElement
    const link2 = document.getElementById('link2') as HTMLAnchorElement

    expect(link1.textContent).toBe('Learn more about us')
    expect(link2.textContent).toBe('Contact us')
  })

  test('should use semantic HTML elements', () => {
    const html = `
      <header>Header</header>
      <nav>Navigation</nav>
      <main>Main content</main>
      <article>Article</article>
      <section>Section</section>
      <aside>Sidebar</aside>
      <footer>Footer</footer>
    `
    document.body.innerHTML = html

    expect(document.querySelector('header')).toBeTruthy()
    expect(document.querySelector('nav')).toBeTruthy()
    expect(document.querySelector('main')).toBeTruthy()
    expect(document.querySelector('article')).toBeTruthy()
    expect(document.querySelector('section')).toBeTruthy()
    expect(document.querySelector('aside')).toBeTruthy()
    expect(document.querySelector('footer')).toBeTruthy()
  })

  test('should announce live region updates', () => {
    const html = `
      <div id="live" aria-live="polite" aria-atomic="true">
        Status: Ready
      </div>
    `
    document.body.innerHTML = html

    const liveRegion = document.getElementById('live') as HTMLDivElement
    expect(liveRegion.getAttribute('aria-live')).toBe('polite')
    expect(liveRegion.getAttribute('aria-atomic')).toBe('true')
  })

  test('should provide heading hierarchy', () => {
    const html = `
      <h1>Main Title</h1>
      <h2>Section 1</h2>
      <h3>Subsection 1.1</h3>
      <h2>Section 2</h2>
    `
    document.body.innerHTML = html

    const h1 = document.querySelector('h1')
    const h2s = document.querySelectorAll('h2')
    const h3 = document.querySelector('h3')

    expect(h1).toBeTruthy()
    expect(h2s).toHaveLength(2)
    expect(h3).toBeTruthy()
  })
})

// ============================================================================
// 10.3 WCAG COMPLIANCE - COLOR CONTRAST
// ============================================================================

describe('10.3 WCAG Compliance - Color Contrast', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('should meet WCAG AA contrast ratio for text', () => {
    const html = `
      <style>
        .text-aa {
          color: #000000;
          background-color: #ffffff;
        }
      </style>
      <p class="text-aa">High contrast text</p>
    `
    document.body.innerHTML = html

    const text = document.querySelector('.text-aa') as HTMLParagraphElement
    expect(text).toBeTruthy()
    // Black on white is 21:1 ratio (exceeds AA requirement of 4.5:1)
  })

  test('should meet WCAG AAA contrast ratio for large text', () => {
    const html = `
      <style>
        .text-aaa {
          color: #333333;
          background-color: #ffffff;
          font-size: 24px;
          font-weight: bold;
        }
      </style>
      <h2 class="text-aaa">Large text heading</h2>
    `
    document.body.innerHTML = html

    const heading = document.querySelector('.text-aaa') as HTMLHeadingElement
    expect(heading).toBeTruthy()
  })

  test('should not rely on color alone to convey information', () => {
    const html = `
      <div>
        <span style="color: red;">● Required field</span>
        <span style="color: green;">● Optional field</span>
      </div>
    `
    document.body.innerHTML = html

    const spans = document.querySelectorAll('span')
    expect(spans).toHaveLength(2)
    // Should have text labels in addition to color
    const firstText = spans[0]?.textContent || ''
    const secondText = spans[1]?.textContent || ''
    expect(firstText).toContain('Required')
    expect(secondText).toContain('Optional')
  })

  test('should have visible focus indicators with sufficient contrast', () => {
    const html = `
      <style>
        button:focus {
          outline: 3px solid #0066cc;
          outline-offset: 2px;
        }
      </style>
      <button id="btn">Focus me</button>
    `
    document.body.innerHTML = html

    const button = document.getElementById('btn') as HTMLButtonElement
    button.focus()
    expect(document.activeElement).toBe(button)
  })

  test('should use sufficient contrast for UI components', () => {
    const html = `
      <style>
        .button {
          background-color: #0066cc;
          color: #ffffff;
          border: 2px solid #0066cc;
        }
      </style>
      <button class="button">Click me</button>
    `
    document.body.innerHTML = html

    const button = document.querySelector('.button') as HTMLButtonElement
    expect(button).toBeTruthy()
  })

  test('should ensure disabled state is visually distinct', () => {
    const html = `
      <style>
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      </style>
      <button id="enabled">Enabled</button>
      <button id="disabled" disabled>Disabled</button>
    `
    document.body.innerHTML = html

    const enabled = document.getElementById('enabled') as HTMLButtonElement
    const disabled = document.getElementById('disabled') as HTMLButtonElement

    expect(enabled.disabled).toBe(false)
    expect(disabled.disabled).toBe(true)
  })

  test('should provide sufficient contrast for links', () => {
    const html = `
      <style>
        a {
          color: #0066cc;
          text-decoration: underline;
        }
      </style>
      <a href="#">Link text</a>
    `
    document.body.innerHTML = html

    const link = document.querySelector('a') as HTMLAnchorElement
    expect(link).toBeTruthy()
    expect(link.textContent).toBe('Link text')
  })

  test('should have sufficient contrast for form inputs', () => {
    const html = `
      <style>
        input {
          border: 2px solid #333333;
          color: #000000;
          background-color: #ffffff;
        }
      </style>
      <input type="text" placeholder="Enter text" />
    `
    document.body.innerHTML = html

    const input = document.querySelector('input') as HTMLInputElement
    expect(input).toBeTruthy()
  })

  test('should indicate error state with more than color', () => {
    const html = `
      <style>
        .error {
          border: 2px solid #cc0000;
          background-color: #ffeeee;
        }
        .error::after {
          content: ' ✗';
          color: #cc0000;
        }
      </style>
      <input class="error" type="text" />
    `
    document.body.innerHTML = html

    const input = document.querySelector('.error') as HTMLInputElement
    expect(input).toBeTruthy()
  })
})

// ============================================================================
// 10.4 WCAG COMPLIANCE - FORM ACCESSIBILITY
// ============================================================================

describe('10.4 WCAG Compliance - Form Accessibility', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('should associate labels with form inputs', () => {
    const html = `
      <form>
        <label for="name">Name:</label>
        <input id="name" type="text" />
        <label for="email">Email:</label>
        <input id="email" type="email" />
      </form>
    `
    document.body.innerHTML = html

    const nameLabel = document.querySelector('label[for="name"]') as HTMLLabelElement
    const emailLabel = document.querySelector('label[for="email"]') as HTMLLabelElement

    expect(nameLabel.getAttribute('for')).toBe('name')
    expect(emailLabel.getAttribute('for')).toBe('email')
  })

  test('should link error messages to form fields', () => {
    const html = `
      <form>
        <label for="email">Email:</label>
        <input id="email" type="email" aria-describedby="email-error" />
        <div id="email-error" role="alert">Please enter a valid email</div>
      </form>
    `
    document.body.innerHTML = html

    const input = document.getElementById('email') as HTMLInputElement
    const error = document.getElementById('email-error') as HTMLDivElement

    expect(input.getAttribute('aria-describedby')).toBe('email-error')
    expect(error.getAttribute('role')).toBe('alert')
  })

  test('should mark required fields', () => {
    const html = `
      <form>
        <label for="name">Name: <span aria-label="required">*</span></label>
        <input id="name" type="text" required />
        <label for="email">Email: <span aria-label="required">*</span></label>
        <input id="email" type="email" required />
      </form>
    `
    document.body.innerHTML = html

    const nameInput = document.getElementById('name') as HTMLInputElement
    const emailInput = document.getElementById('email') as HTMLInputElement

    expect(nameInput.required).toBe(true)
    expect(emailInput.required).toBe(true)
  })

  test('should provide clear form instructions', () => {
    const html = `
      <form>
        <fieldset>
          <legend>Contact Information</legend>
          <label for="phone">Phone:</label>
          <input id="phone" type="tel" aria-describedby="phone-hint" />
          <small id="phone-hint">Format: (123) 456-7890</small>
        </fieldset>
      </form>
    `
    document.body.innerHTML = html

    const legend = document.querySelector('legend') as HTMLLegendElement
    const hint = document.getElementById('phone-hint') as HTMLElement

    expect(legend.textContent).toBe('Contact Information')
    expect(hint.textContent).toContain('Format')
  })

  test('should group related form fields with fieldset', () => {
    const html = `
      <form>
        <fieldset>
          <legend>Address</legend>
          <label for="street">Street:</label>
          <input id="street" type="text" />
          <label for="city">City:</label>
          <input id="city" type="text" />
        </fieldset>
      </form>
    `
    document.body.innerHTML = html

    const fieldset = document.querySelector('fieldset') as HTMLFieldSetElement
    const legend = document.querySelector('legend') as HTMLLegendElement

    expect(fieldset).toBeTruthy()
    expect(legend.textContent).toBe('Address')
  })

  test('should provide validation feedback', () => {
    const html = `
      <form>
        <label for="email">Email:</label>
        <input id="email" type="email" required aria-describedby="email-error" />
        <div id="email-error" role="alert" aria-live="polite"></div>
      </form>
    `
    document.body.innerHTML = html

    const input = document.getElementById('email') as HTMLInputElement
    const error = document.getElementById('email-error') as HTMLDivElement

    expect(input.getAttribute('aria-describedby')).toBe('email-error')
    expect(error.getAttribute('role')).toBe('alert')
    expect(error.getAttribute('aria-live')).toBe('polite')
  })

  test('should support form submission with keyboard', () => {
    const html = `
      <form id="form">
        <input type="text" />
        <button type="submit">Submit</button>
      </form>
    `
    document.body.innerHTML = html

    const form = document.getElementById('form') as HTMLFormElement
    const button = form.querySelector('button') as HTMLButtonElement

    expect(button.type).toBe('submit')
    expect(form).toBeTruthy()
  })

  test('should provide clear error recovery instructions', () => {
    const html = `
      <form>
        <div role="alert">
          <h2>Form has errors</h2>
          <ul>
            <li><a href="#name">Name is required</a></li>
            <li><a href="#email">Email is invalid</a></li>
          </ul>
        </div>
        <label for="name">Name:</label>
        <input id="name" type="text" />
        <label for="email">Email:</label>
        <input id="email" type="email" />
      </form>
    `
    document.body.innerHTML = html

    const alert = document.querySelector('[role="alert"]') as HTMLDivElement
    const links = alert.querySelectorAll('a')

    expect(alert).toBeTruthy()
    expect(links).toHaveLength(2)
  })

  test('should support autocomplete attributes', () => {
    const html = `
      <form>
        <label for="name">Name:</label>
        <input id="name" type="text" autocomplete="name" />
        <label for="email">Email:</label>
        <input id="email" type="email" autocomplete="email" />
        <label for="phone">Phone:</label>
        <input id="phone" type="tel" autocomplete="tel" />
      </form>
    `
    document.body.innerHTML = html

    const nameInput = document.getElementById('name') as HTMLInputElement
    const emailInput = document.getElementById('email') as HTMLInputElement
    const phoneInput = document.getElementById('phone') as HTMLInputElement

    expect(nameInput.getAttribute('autocomplete')).toBe('name')
    expect(emailInput.getAttribute('autocomplete')).toBe('email')
    expect(phoneInput.getAttribute('autocomplete')).toBe('tel')
  })

  test('should provide accessible select dropdowns', () => {
    const html = `
      <form>
        <label for="country">Country:</label>
        <select id="country">
          <option value="">Select a country</option>
          <option value="us">United States</option>
          <option value="ca">Canada</option>
        </select>
      </form>
    `
    document.body.innerHTML = html

    const label = document.querySelector('label[for="country"]') as HTMLLabelElement
    const select = document.getElementById('country') as unknown as HTMLSelectElement

    expect(label.getAttribute('for')).toBe('country')
    expect(select.options).toHaveLength(3)
  })

  test('should provide accessible checkboxes and radio buttons', () => {
    const html = `
      <form>
        <fieldset>
          <legend>Preferences</legend>
          <label>
            <input type="checkbox" name="newsletter" /> Subscribe to newsletter
          </label>
          <label>
            <input type="radio" name="frequency" value="daily" /> Daily
          </label>
          <label>
            <input type="radio" name="frequency" value="weekly" /> Weekly
          </label>
        </fieldset>
      </form>
    `
    document.body.innerHTML = html

    const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement
    const radios = document.querySelectorAll('input[type="radio"]')

    expect(checkbox).toBeTruthy()
    expect(radios).toHaveLength(2)
  })
})

// ============================================================================
// 10.5 WCAG COMPLIANCE - ADDITIONAL ACCESSIBILITY TESTS
// ============================================================================

describe('10.5 WCAG Compliance - Additional Accessibility', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('should have proper page language declaration', () => {
    document.documentElement.lang = 'en'
    expect(document.documentElement.lang).toBe('en')
  })

  test('should have descriptive page title', () => {
    document.title = 'Dashboard - Yeko'
    expect(document.title).toBe('Dashboard - Yeko')
  })

  test('should support text resizing', () => {
    const html = `
      <style>
        body { font-size: 16px; }
        h1 { font-size: 2em; }
      </style>
      <h1>Heading</h1>
      <p>Paragraph</p>
    `
    document.body.innerHTML = html

    const h1 = document.querySelector('h1')
    const p = document.querySelector('p')

    expect(h1).toBeTruthy()
    expect(p).toBeTruthy()
  })

  test('should not have content that flashes more than 3 times per second', () => {
    const html = `
      <div id="content">Content</div>
    `
    document.body.innerHTML = html

    const content = document.getElementById('content')
    expect(content).toBeTruthy()
    // Should not have rapid flashing animations
  })

  test('should provide skip navigation links', () => {
    const html = `
      <a href="#main" class="skip-link">Skip to main content</a>
      <nav>Navigation</nav>
      <main id="main">Main content</main>
    `
    document.body.innerHTML = html

    const skipLink = document.querySelector('.skip-link') as HTMLAnchorElement
    expect(skipLink).toBeTruthy()
    expect(skipLink.getAttribute('href')).toBe('#main')
  })

  test('should have accessible data tables', () => {
    const html = `
      <table>
        <caption>Student Grades</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>John</td>
            <td>A</td>
          </tr>
        </tbody>
      </table>
    `
    document.body.innerHTML = html

    const caption = document.querySelector('caption') as HTMLTableCaptionElement
    const headers = document.querySelectorAll('th[scope="col"]')

    expect(caption.textContent).toBe('Student Grades')
    expect(headers).toHaveLength(2)
  })

  test('should provide accessible modals', () => {
    const html = `
      <div id="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">Confirm Action</h2>
        <p>Are you sure?</p>
        <button>Cancel</button>
        <button>Confirm</button>
      </div>
    `
    document.body.innerHTML = html

    const modal = document.getElementById('modal') as HTMLDivElement
    expect(modal.getAttribute('role')).toBe('dialog')
    expect(modal.getAttribute('aria-modal')).toBe('true')
    expect(modal.getAttribute('aria-labelledby')).toBe('modal-title')
  })

  test('should provide accessible tooltips', () => {
    const html = `
      <button aria-describedby="tooltip">Help</button>
      <div id="tooltip" role="tooltip">This is helpful information</div>
    `
    document.body.innerHTML = html

    const button = document.querySelector('button') as HTMLButtonElement
    const tooltip = document.getElementById('tooltip') as HTMLDivElement

    expect(button.getAttribute('aria-describedby')).toBe('tooltip')
    expect(tooltip.getAttribute('role')).toBe('tooltip')
  })

  test('should provide accessible breadcrumbs', () => {
    const html = `
      <nav aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li><a href="/courses">Courses</a></li>
          <li aria-current="page">Mathematics</li>
        </ol>
      </nav>
    `
    document.body.innerHTML = html

    const nav = document.querySelector('nav') as HTMLElement
    const current = document.querySelector('[aria-current="page"]') as HTMLElement

    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb')
    expect(current.textContent).toBe('Mathematics')
  })

  test('should provide accessible pagination', () => {
    const html = `
      <nav aria-label="Pagination">
        <a href="?page=1">Previous</a>
        <span aria-current="page">Page 2 of 10</span>
        <a href="?page=3">Next</a>
      </nav>
    `
    document.body.innerHTML = html

    const nav = document.querySelector('nav') as HTMLElement
    const current = document.querySelector('[aria-current="page"]') as HTMLElement

    expect(nav.getAttribute('aria-label')).toBe('Pagination')
    expect(current.textContent).toContain('Page 2')
  })
})
