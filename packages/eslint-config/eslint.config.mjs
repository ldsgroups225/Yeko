import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  ignores: [
    'components/ui/**',
    'scripts/**',
    '*.config.js',
    '*.config.ts',
    '*.d.ts',
    '*.jsonc',
    '*.md',
    'build',
    'coverage',
    'coverage/**',
    'dist/**',
    'eslint.config.mjs',
    'node_modules',
    'package-lock.json',
    'package.json',
    'pnpm-lock.yaml',
    'public',
    'yarn.lock',
  ],
})
