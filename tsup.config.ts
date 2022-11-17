import { relative, resolve as resolveDir } from 'node:path'
import { defineConfig } from 'tsup'

const config = defineConfig({
  clean: true,
  entry: ['src/cli.ts'],
  format: ['esm'],
  outDir: 'dist',
  minify: true,
  skipNodeModulesBundle: true,
  sourcemap: true,
  target: 'es2021',
  tsconfig: relative(__dirname, resolveDir(process.cwd(), 'tsconfig.json')),
  keepNames: true,
  treeshake: true
})

export default config
