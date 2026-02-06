import antfu from '@antfu/eslint-config'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import neverthrow from 'eslint-plugin-neverthrow'

/**
 * ESLint configuration for the Yeko project
 * Based on @antfu/eslint-config with TypeScript and React support
 * Includes accessibility (a11y) rules via eslint-plugin-jsx-a11y
 */
export default antfu({
  // Enable TypeScript support
  typescript: true,

  // Enable React support
  react: true,

  // Configure formatters
  formatters: true,

  // Configure ignore patterns
  ignores: [
    '**/dist/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/.next/**',
    '**/.nuxt/**',
    '**/.output/**',
    '**/.turbo/**',
  ],
}, {
  // Better Tailwind CSS plugin configuration
  // Only apply to projects that have Tailwind CSS installed
  files: ['apps/core/**/*.{ts,tsx,js,jsx}'],
  plugins: {
    'better-tailwindcss': betterTailwindcss,
  },
  settings: {
    'better-tailwindcss': {
      // Tailwind CSS v4: path to the CSS entry file (relative to where ESLint runs)
      entryPoint: 'src/styles.css',
      // Allow custom classes defined in @layer utilities
      allowUnknownClasses: true,
    },
  },
  rules: {
    // Stylistic rules (recommended config)
    'better-tailwindcss/enforce-consistent-line-wrapping': 'warn',
    'better-tailwindcss/enforce-consistent-class-order': 'warn',
    'better-tailwindcss/no-duplicate-classes': 'warn',
    'better-tailwindcss/no-unnecessary-whitespace': 'warn',

    // Correctness rules (recommended config)
    // Disabled because Tailwind v4 @theme inline and custom utilities aren't fully detected
    'better-tailwindcss/no-unregistered-classes': 'off',
    'better-tailwindcss/no-conflicting-classes': 'warn',

    // Optional stylistic rules (not in recommended by default)
    'better-tailwindcss/enforce-consistent-variable-syntax': 'off',
    'better-tailwindcss/enforce-consistent-important-position': 'off',
    'better-tailwindcss/enforce-shorthand-classes': 'off',
    'better-tailwindcss/no-deprecated-classes': 'warn',
    'better-tailwindcss/no-restricted-classes': 'off',
  },
}, {
  // JSX Accessibility (a11y) plugin configuration
  plugins: {
    'jsx-a11y': jsxA11y,
  },
  settings: {
    'jsx-a11y': {
      // Map custom components to DOM elements for a11y checking
      components: {
        // shadcn/ui components
        Button: 'button',
        // Note: Don't map TanStack Router Link to 'a' - it has its own navigation logic
        Card: 'div',
        Dialog: 'div',
        Sheet: 'div',
        Popover: 'div',
        Tooltip: 'div',
        Tabs: 'div',
        Accordion: 'div',
      },
      // Map JSX attributes to DOM attributes
      attributes: {
        for: ['htmlFor', 'for'],
      },
      // Support polymorphic components with 'as' prop
      polymorphicPropName: 'as',
      polymorphicAllowList: ['Button', 'Card'],
    },
  },
  rules: {
    // Recommended accessibility rules
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/anchor-is-valid': ['error', {
      components: ['Link'],
      specialLink: ['to'],
      aspects: ['invalidHref', 'preferButton'],
    }],
    'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/autocomplete-valid': 'error',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/html-has-lang': 'error',
    'jsx-a11y/iframe-has-title': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-a11y/interactive-supports-focus': 'warn',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/media-has-caption': 'error',
    'jsx-a11y/mouse-events-have-key-events': 'warn',
    'jsx-a11y/no-access-key': 'error',
    'jsx-a11y/no-aria-hidden-on-focusable': 'error',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/no-distracting-elements': 'error',
    'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
    'jsx-a11y/no-noninteractive-tabindex': 'error',
    'jsx-a11y/no-redundant-roles': 'error',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    'jsx-a11y/scope': 'error',
    'jsx-a11y/tabindex-no-positive': 'error',
  },
}, {
  // Vitest plugin configuration for test files
  // Note: antfu config already includes vitest support, we're just customizing the rules
  files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
  rules: {
    // Customize Vitest rules (antfu already includes the plugin)
    'test/max-nested-describe': ['warn', { max: 3 }],
    'test/no-disabled-tests': 'warn',
    'test/no-focused-tests': 'error',
    'test/prefer-to-be': 'warn',
    'test/prefer-to-have-length': 'warn',
    'test/prefer-strict-equal': 'warn',
    'test/prefer-expect-resolves': 'warn',
    'test/consistent-test-it': ['warn', { fn: 'test' }],
    'test/expect-expect': 'warn',
    'test/no-identical-title': 'error',
    'test/valid-expect': 'error',
  },
}, {
  // Neverthrow plugin configuration
  plugins: {
    neverthrow,
  },
  rules: {
    'neverthrow/must-use-result': 'off', // Disabled globally to prevent crash, will enable per-project
  },
}, {
  // TanStack Router route files specific configuration
  // These files export a 'Route' constant which triggers react-refresh/only-export-components
  files: ['**/src/routes/**/*.tsx'],
  rules: {
    'react-refresh/only-export-components': 'off',
  },
})
