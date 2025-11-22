import config from '@yeko/eslint-config'

/** @type {import("eslint").Linter.Config} */

export default config.append(
  {
    ignores: [
      'dist/',
      'node_modules/',
      '**/*.md',
    ],
  },
  {
    rules: {
      'node/prefer-global/process': 'off',
    },
  },
)
