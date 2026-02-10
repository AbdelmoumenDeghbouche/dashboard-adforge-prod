import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['5a9d81b9675f.ngrok-free.app', "localhost", "127.0.0.1"],
    proxy: {
      // Proxy all /api requests to backend
      '/api': {
        target: 'https://dr3ew7bdk589v.cloudfront.net', // ← CHANGE THIS
        changeOrigin: true,
        secure: false,
        // Don't rewrite the path - keep /api prefix
        rewrite: (path) => path
      }
    }
  }
})
