import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const config = defineConfig({
  plugins: [
    // this is plugin that enables path aliases
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
  // Fix SSR dependency optimization issues
  optimizeDeps: {
    // Exclude packages that have ESM/CJS interop issues
    exclude: [
      '@tanstack/react-router',
      '@tanstack/react-query',
      '@tanstack/react-start',
      'better-auth',
    ],
  },
  ssr: {
    // Ensure proper module resolution for SSR
    noExternal: [
      '@tanstack/react-router',
      '@tanstack/react-query',
      '@tanstack/react-start',
    ],
  },
})

export default config
