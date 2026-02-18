import config from '@yeko/eslint-config'

/** @type {import("eslint").Linter.Config} */

export default config.append({
  ignores: [
    'dist/',
    'public/',
    'scripts/',
    'src/routeTree.gen.ts',
    'src/i18n/',
    '**/*.md',
    '**/playwright-report/**',
    '**/test-results/**',
  ],
})
