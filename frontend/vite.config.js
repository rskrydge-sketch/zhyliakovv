import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['zhyliakovv.local', 'zhyliakovv-hair.pp.ua', 'localhost', '1e53-46-219-2-37.ngrok-free.app'],
  },
  preview: {
    port: 3000,
    host: true,
  },
})
