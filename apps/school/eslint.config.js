import config from '@yeko/eslint-config'

/** @type {import("eslint").Linter.Config} */

export default config.append({
  ignores: [
    'dist/',
    '.wrangler/',
    'public/',
    '**/*.md',
    'scripts/',
    'src/components/ui/',
    'src/i18n/',
    'src/i18n/**',
    'src/routeTree.gen.ts',
  ],
  rules: {
    'react-hooks/incompatible-library': 'off',
  },
}, {
  files: ['src/components/ui/**/*.tsx', 'src/components/ui/**/*.ts'],
  rules: {
    'react-refresh/only-export-components': 'off',
    'jsx-a11y/no-autofocus': 'off',
    'react-dom/no-dangerously-set-innerhtml': 'off',
  },
}, {
  files: ['src/i18n/**/*.{ts,tsx}'],
  rules: {
    'eslint-comments/no-unlimited-disable': 'off',
    'react-refresh/only-export-components': 'off',
    'react/no-unstable-context-value': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
}, {
  files: ['**/*.gen.ts', '**/*.gen.tsx'],
  rules: {
    'eslint-comments/no-unlimited-disable': 'off',
  },
})
