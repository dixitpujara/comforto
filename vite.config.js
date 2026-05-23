import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel serves from root; GitHub Pages serves from /comforto/.
// Vercel automatically sets the VERCEL env var during build, so we use
// that to pick the correct base path without breaking either deploy.
const isVercel = !!process.env.VERCEL

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: isVercel ? '/' : '/comforto/',
})
