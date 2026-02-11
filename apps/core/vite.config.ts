import type { Plugin } from 'vite'
import path from 'node:path'
import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const dataOpsRoot = path.resolve(__dirname, '../../packages/data-ops/src')
const browserIndex = path.join(dataOpsRoot, 'index.browser.ts')

function dataOpsBrowserGuard(): Plugin {
  return {
    name: 'data-ops-browser-guard',
    enforce: 'pre',
    resolveId(id, _importer, options) {
      if (options?.ssr)
        return

      if (id === '@repo/data-ops') {
        return browserIndex
      }
    },
  }
}

function stubServerModulesForClient(): Plugin {
  const dbSetupFile = path.join(dataOpsRoot, 'database', 'setup.ts')

  return {
    name: 'stub-server-modules-for-client',
    enforce: 'post',
    transform(code, id, options) {
      if (options?.ssr)
        return

      if (id === dbSetupFile || id.endsWith('/data-ops/src/database/setup.ts')) {
        return {
          code: `
            export function initDatabase() { return undefined; }
            export function getDb() { throw new Error('[stub] getDb() called in client code'); }
            export function resetDbForTesting() {}
            export const and = undefined, asc = undefined, desc = undefined, eq = undefined;
            export const ilike = undefined, inArray = undefined, isNotNull = undefined;
            export const isNull = undefined, like = undefined, notInArray = undefined;
            export const or = undefined, sql = undefined;
          `,
          map: null,
        }
      }

      const normalizedId = id.replace(/\\/g, '/')
      if (normalizedId.includes('/data-ops/src/queries/') && code.includes('node:crypto')) {
        return {
          code: code.replace(
            /import\s*\{[^}]*\}\s*from\s*['"]node:crypto['"]/g,
            'const randomUUID = () => crypto.randomUUID()',
          ),
          map: null,
        }
      }
    },
  }
}

export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  plugins: [
    dataOpsBrowserGuard(),
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
    stubServerModulesForClient(),
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
      'xlsx',
      'xlsx-js-style',
      '@chronicstone/typed-xlsx',
      '@tabler/icons-react',
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
