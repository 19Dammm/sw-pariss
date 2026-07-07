import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/** Replace NOM-DU-REPO with your GitHub repository name before deploying. */
const REPO_NAME = 'sw-pariss'

function spaFallback(): Plugin {
  return {
    name: 'spa-fallback',
    closeBundle() {
      const indexPath = resolve(__dirname, 'dist/index.html')
      const fallbackPath = resolve(__dirname, 'dist/404.html')
      if (existsSync(indexPath)) {
        copyFileSync(indexPath, fallbackPath)
      }
    },
  }
}

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? `/${REPO_NAME}/` : '/',
  plugins: [react(), spaFallback()],
})
