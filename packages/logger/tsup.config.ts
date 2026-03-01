import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  clean: true,
  external: ['@logtape/logtape'],
  tsconfig: './tsconfig.build.json',
})
