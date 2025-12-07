import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Base path for GitHub Pages (change if your repo name is different)
  base: process.env.NODE_ENV === 'production' ? '/Harvest/' : '/',
  build: {
    target: 'es2015',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    outDir: 'dist'
  },
  server: {
    host: true,
    port: 5173
  }
})

