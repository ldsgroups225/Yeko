import config from '@yeko/eslint-config'

/** @type {import("eslint").Linter.Config} */

export default config.append(
  {
    ignores: [
      'dist/',
      '.wrangler/',
      'public/',
      'scripts/',
      'src/routeTree.gen.ts',
      'src/i18n/',
      '**/*.md',
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.next/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },
  {
    rules: {
      'node/prefer-global/process': 'off',
    },
  },
)
