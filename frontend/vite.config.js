import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Build with root-relative asset paths so shared-host deployments that
  // extract directly into /public work without an extra /quiz subfolder.
  base: '/',
  plugins: [react()],
  build: {
    // Flatten generated JS/CSS into the build root. Some shared-host file
    // managers handle nested asset paths inconsistently under subdirectories.
    assetsDir: '',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
}))
