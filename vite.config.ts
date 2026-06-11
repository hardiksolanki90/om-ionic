/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const BACKEND = 'http://api.om.test'
const BACKEND_HOST = 'api.om.test'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],
  server: {
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
        headers: { host: BACKEND_HOST },
      },
      '/sanctum': {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
        headers: { host: BACKEND_HOST },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
