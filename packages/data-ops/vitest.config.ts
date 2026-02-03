import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.ts', 'src/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      exclude: [
        'node_modules/',
        'dist/',
        'src/tests/utils/**',
        'src/**/*.d.ts',
        'src/drizzle/**',
        'src/database/migrations/**',
        'src/i18n/**',
      ],
    },
    reporters: ['verbose'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
