import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // MCP-optimized: JSON reporter for structured output
    reporters: ['json'],

    // Coverage configuration for gap analysis
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['json', 'html'],
      reportsDirectory: './coverage-mcp',
      // Include all testable source files
      include: [
        'src/**/*.{ts,tsx}',
      ],
      // Exclude test files, generated files, etc.
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.d.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/.wrangler/**',
        '**/e2e/**',
        '**/test/**',
        '**/test-setup.ts',
        '**/routeTree.gen.ts',
        '**/i18n/**',
        '**/*.stories.tsx',
      ],
      // Coverage thresholds for reporting
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },

    // Test environment
    environment: 'jsdom',
    globals: true,

    // Performance settings
    isolate: true,
    fileParallelism: true,
    testTimeout: 30000,
    hookTimeout: 10000,

    // Safety: Disable watch mode for MCP
    watch: false,

    // Include test files
    include: [
      'src/**/*.{test,spec}.{js,ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.wrangler/**',
      '**/e2e/**',
    ],
  },

  // Path resolution for monorepo
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },

  // TypeScript paths
  plugins: [
    // Plugins would be added by individual app configs
  ],
})
