import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Keep `base` configurable for GitHub Pages project sites.
// Example build command:
// VITE_BASE_PATH="/your-repo-name/" npm run build
export default defineConfig(({ mode }) => {
  // loadEnv avoids direct `process.env` access and keeps ESLint happy.
  const env = loadEnv(mode, '.', '')
  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || '/',
  }
})
