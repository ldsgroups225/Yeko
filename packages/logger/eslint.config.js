import config from '@yeko/eslint-config'

/** @type {import("eslint").Linter.Config} */

export default config.append({
  ignores: [
    'dist/',
    '**/*.md',
  ],
})
