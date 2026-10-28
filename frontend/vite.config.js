import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// La app vive en https://myappsserver.duckdns.org/materialesis/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_TARGET || 'https://myappsserver.duckdns.org'
  return {
    base: '/materialesis/',
    plugins: [react(), tailwindcss()],
    build: { outDir: '../dist', emptyOutDir: true },
    server: {
      // En desarrollo, la API PHP se usa a través de este proxy
      proxy: {
        '/materialesis/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: 'localhost',
        },
      },
    },
  }
})
