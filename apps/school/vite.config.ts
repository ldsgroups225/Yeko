import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const config = defineConfig({
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      srcDirectory: 'src',
      start: { entry: './start.tsx' },
      server: { entry: './server.ts' },
    }),
    viteReact(),
    cloudflare({
      viteEnvironment: {
        name: 'ssr',
      },
    }),
  ],
  server: {
    hmr: {
      port: 3002, // Use different port for HMR to avoid conflicts
    },
  },
  optimizeDeps: {
    // Exclude problematic dependencies from optimization
    exclude: [
      'better-auth',
      'better-auth/react',
      '@repo/data-ops',
      'motion/react',
      '@base-ui-components/react',
      'recharts',
      'cmdk',
    ],
    // Force optimization for dependencies that work fine
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'zod',
      'clsx',
      'tailwind-merge',
    ],
  },
  // Remove ssr.external as it's incompatible with Cloudflare plugin
})

export default config
