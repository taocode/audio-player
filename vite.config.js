import { copyFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

/** Copy demo.html into dist/ on each build for `vite preview`. */
function demoPage() {
  return {
    name: 'demo-page',
    writeBundle() {
      copyFileSync('demo.html', 'dist/demo.html');
      copyFileSync('demo.html', 'dist/index.html');
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    // Inner components: regular Svelte (matches WCD / svelte#3594 pattern)
    svelte({
      exclude: ['**/index.svelte'],
      emitCss: false,
    }),
    // Entry only: web component custom element
    svelte({
      include: ['**/index.svelte'],
      compilerOptions: {
        customElement: true,
      },
      emitCss: false,
    }),
    demoPage(),
  ],
  build: {
    lib: {
      entry: 'src/index.js',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    sourcemap: true,
    target: 'es2020',
    emptyOutDir: true,
    cssCodeSplit: false,
    minify: mode === 'production',
  },
  preview: {
    port: 5173,
    strictPort: true,
    open: '/demo.html',
  },
}));
