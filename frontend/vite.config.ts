import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://13.53.39.8',  // ← Change this to port 80
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
