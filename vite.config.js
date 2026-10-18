import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Chemins relatifs : le build peut être ouvert directement (double-clic sur dist/index.html).
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
})
