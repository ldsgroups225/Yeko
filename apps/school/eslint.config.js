import config from '@yeko/eslint-config'

/** @type {import("eslint").Linter.Config} */

export default config.append({
  ignores: [
    'dist/',
    '.wrangler/',
    'public/',
    '**/*.md',
    'scripts/',
    '**/components/ui/**',
    '**/routeTree.gen.ts',
  ],
  rules: {
    // React Compiler warnings - these are informational and don't affect functionality
    // The compiler automatically skips components with incompatible libraries
    'react-hooks/incompatible-library': 'off',

    // Allow direct setState in useEffect when using the onChange pattern
    'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
  },
})
