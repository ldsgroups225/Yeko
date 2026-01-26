import path from 'node:path'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    viteReact(),
  ],
  resolve: {
    alias: {
      'cloudflare:workers': path.resolve(__dirname, './src/mocks/cloudflare-workers.ts'),
      '@repo/data-ops/database/setup': path.resolve(__dirname, './src/mocks/db-setup.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.wrangler/**', '**/e2e/**'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      reportsDirectory: './coverage',
      include: [
        'src/core/**',
        'src/components/**',
        'src/hooks/**',
        'src/lib/**',
        'src/schemas/**',
        'src/utils/**',
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/.wrangler/**',
        '**/test-setup.ts',
        '**/test/**',
        '**/e2e/**',
        '**/*.d.ts',
        '**/routeTree.gen.ts',
        '**/i18n/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      ignoreClassMethods: ['render', 'componentDidMount', 'componentDidUpdate'],
      cleanOnRerun: true,
    },

    isolate: true,
    fileParallelism: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    maxConcurrency: 4,
    watch: false,
    reporters: ['default', 'verbose'],
    env: {
      NODE_ENV: 'test',
      TZ: 'UTC',
    },
    clearMocks: true,
    restoreMocks: true,
    mockReset: false,
  },
})
