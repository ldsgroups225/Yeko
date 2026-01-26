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
    ],
  },
  {
    rules: {
      'node/prefer-global/process': 'off',
      'react-hooks-extra/no-direct-set-state-in-use-effect': 'error',
    },
  },
)
