import config from '@yeko/eslint-config'

/** @type {import("eslint").Linter.Config} */

export default config.append({
  rules: {
    'node/prefer-global/process': 'off',
  },
  ignores: [
    'dist/',
    '.wrangler/',
    'public/',
    '.claude',
    'scripts/',
    'src/routeTree.gen.ts',
  ],
})
