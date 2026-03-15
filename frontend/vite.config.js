import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Build under /quiz in production while keeping local development at /
  base: command === 'build' ? '/quiz/' : '/',
  plugins: [react()],
}))
