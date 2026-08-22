import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://test.hashoster.co.in/',
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: 'https://test.hashoster.co.in/',
        changeOrigin: true,
        secure: false,
      },
      '/user': {
        target: 'https://test.hashoster.co.in/',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
