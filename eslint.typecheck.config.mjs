import config from '@yeko/eslint-config'

/** @type {import("eslint").Linter.Config} */
export default config.append(
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
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
    ],
  },
)
