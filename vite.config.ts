import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // Readable in DevTools, collision-safe in consumer apps.
      // Consumers must never target these class names; use the `className` prop instead.
      generateScopedName: 'ufi-[local]-[hash:base64:5]',
    },
  },
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      cssFileName: 'styles',
    },
    // A single stylesheet (`@ufisoft/ui/styles.css`) keeps consumption bundler-agnostic.
    cssCodeSplit: false,
    sourcemap: true,
    rolldownOptions: {
      // Keep every runtime dependency external so consumers get one copy of each.
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^@radix-ui\//,
        /^@floating-ui\//,
        'clsx',
        'downshift',
      ],
      output: {
        // One output module per source module so consumers can tree-shake per component.
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: {
      modules: { classNameStrategy: 'non-scoped' },
    },
  },
});
