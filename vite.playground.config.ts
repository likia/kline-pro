import { resolve } from 'path'

import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  root: resolve(__dirname, 'playground'),
  plugins: [solidPlugin()],
  server: {
    port: 4173,
    open: true
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true
  }
})
