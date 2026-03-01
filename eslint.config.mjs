import config from '@yeko/eslint-config'

/** @type {import("eslint").Linter.Config} */
export default config.append(
  {
    ignores: [
      '**/dist/**',
      '**/public/**',
      '**/scripts/**',
      '**/src/routeTree.gen.ts',
      '**/src/i18n/**',
      '**/*.md',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/.next/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/.wrangler/**',
      '**/tasks/**',
      '**/docs/**',
      '**/patches/**',
      '**/pnpm-lock.yaml',
      '**/pnpm-workspace.yaml',
    ],
  },
  {

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
)
