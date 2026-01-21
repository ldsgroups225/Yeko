import path from 'node:path'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.wrangler/**', '**/e2e/**'],

    // Enhanced coverage with v8 provider (2025 features)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      reportsDirectory: './coverage',
      include: [
        'src/lib/**',
        'src/schemas/**',
        'src/school/**',
        'src/components/**',
        'src/hooks/**',
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
      // 2025: Enhanced coverage options
      ignoreClassMethods: ['render', 'componentDidMount', 'componentDidUpdate'],
      cleanOnRerun: true,
    },

    // Enhanced performance and parallelism (2025 features)
    isolate: true,
    fileParallelism: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    maxConcurrency: 4,

    // Enhanced watch mode
    watch: false,

    // Better failure reporting
    reporters: ['default', 'verbose'],

    // Environment variables for testing
    env: {
      NODE_ENV: 'test',
      TZ: 'UTC',
    },

    // Mock optimization
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
