import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: ['src/start.tsx', 'src/server.ts', 'src/router.tsx', 'vite.config.ts'],
  project: ['src/**/*.{ts,tsx}'],
  ignore: ['src/routeTree.gen.ts'],
}

export default config
