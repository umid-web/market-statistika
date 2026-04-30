import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://web-production-1d28d4.up.railway.app',
        changeOrigin: true,
        secure: false
      }
    }
  },
})
