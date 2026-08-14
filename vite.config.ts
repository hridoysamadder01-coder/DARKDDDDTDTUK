import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The `base` must match the GitHub Pages project path:
//   https://<user>.github.io/DARKDDDDTDTUK/
// Override with VITE_BASE=/ for Netlify / Vercel / Render (served from root).
const base = process.env.VITE_BASE ?? '/DARKDDDDTDTUK/'

// https://vitejs.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
  },
})
