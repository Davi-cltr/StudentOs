import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Encaminha /api para o backend Rails (bin/rails server, porta 3000).
    proxy: {
      '/api': process.env.API_TARGET ?? 'http://localhost:3000',
    },
  },
})
