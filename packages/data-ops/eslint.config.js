import config from '@yeko/eslint-config'

/** @type {import("eslint").Linter.Config} */

export default config.append({
  ignores: [
    'dist/',
    'src/seed/',
    'src/verify.ts',
    'scripts',
    'src/i18n/',
  ],
})
