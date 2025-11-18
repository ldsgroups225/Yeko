import config from '@yeko/eslint-config'

/** @type {import("eslint").Linter.Config} */

export default config.append({
  ignores: [
    'dist/',
    '.wrangler/',
    'public/',
    '**/*.md',
    'scripts/',
    'src/components/ui/**',
    'src/routeTree.gen.ts',
  ],
})
