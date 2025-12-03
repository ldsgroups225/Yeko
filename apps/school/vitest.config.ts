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
    environment: 'jsdom', // Enable DOM for UI tests
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.wrangler/**'],

    // Enhanced coverage with v8 provider (2025 features)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      include: [
        'src/schemas/**',
        'src/components/hr/**',
        'src/components/ui/**',
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/node_modules/**',
        '**/test-setup.ts',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
      // 2025: Enhanced coverage options
      all: true,
      ignoreClassMethods: ['render', 'componentDidMount', 'componentDidUpdate'],
      cleanOnRerun: true,
    },

    // Enhanced performance and parallelism (2025 features)
    isolate: true,
    fileParallelism: true,
    testTimeout: 10000, // 10s timeout
    hookTimeout: 10000, // 10s hook timeout
    maxConcurrency: 4, // Enable concurrent test execution

    // Enhanced snapshot support (2025)
    // snapshotEnvironment: 'jsdom', // Removed as it's causing compatibility issues
    // snapshotFormat: {
    //   escapeString: false,
    //   printBasicPrototype: false,
    // },

    // 2025: Enhanced watch mode
    watch: false, // Disabled by default for CI

    // 2025: Better failure reporting
    reporters: ['default', 'verbose'],

    // Global test setup
    setupFiles: ['./test-setup.ts'],

    // 2025: Environment variables for testing
    env: {
      NODE_ENV: 'test',
      TZ: 'UTC',
    },

    // 2025: Mock optimization
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
})
