import { defineConfig } from 'tsup';

export default defineConfig({
  globalName: 'TruffleCLI',
  clean: true,
  dts: true,
  entry: ['src/cli.ts'],
  format: ['esm'],
  minify: false,
  skipNodeModulesBundle: true,
  sourcemap: true,
  target: 'es2022',
  tsconfig: './tsconfig.json',
  keepNames: false, // keepNames: true can do some weird stuff (search keepNames in our discord)
  treeshake: true,
  replaceNodeEnv: false,
});
