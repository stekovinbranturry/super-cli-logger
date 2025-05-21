import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

// https://cdn.jsdelivr.net/npm/tsup/schema.json
export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  minify: !options.watch,
  sourcemap: !options.watch,
  dts: true,
  treeshake: true,
  cjsInterop: true,
  // onSuccess() {},
  // esbuildPlugins: [],
  // esbuildOptions(options, context) {
  //   options.define.foo = '"bar"'
  // },
  ...options,
}));
