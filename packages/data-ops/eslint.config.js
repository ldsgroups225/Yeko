import config from '@yeko/eslint-config'

/** @type {import("eslint").Linter.Config} */

export default config.append(
  {
    ignores: [
      'dist/',
      'node_modules/',
      'src/seed/',
      'src/verify.ts',
      'scripts',
      'src/i18n/',
    ],
  },
  {
    rules: {
      'node/prefer-global/process': 'off',
    },
  },
)
