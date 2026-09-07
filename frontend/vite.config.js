import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://equipment-management-system-production-7e9c.up.railway.app',
        changeOrigin: true
      }
    }
  },
  // Ensure environment variables are exposed
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://equipment-management-system-production-7e9c.up.railway.app/api')
  }
})
