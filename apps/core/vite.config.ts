import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  plugins: [
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
  ssr: {
    noExternal: [
      '@tanstack/react-router',
      '@tanstack/react-query',
      '@tanstack/react-start',
      'better-auth',
      '@base-ui/react',
      'xlsx-js-style',
      '@chronicstone/typed-xlsx',
    ],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      '@tanstack/react-query',
      'better-auth/react',
      'recharts',
      'motion/react',
      'zod',
      'sonner',
      'clsx',
      'tailwind-merge',
      'xlsx',
      'xlsx-js-style',
    ],
    exclude: [],
  },
})
