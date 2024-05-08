import { defineConfig } from 'vite'
import { resolve } from "path"
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: "WebLogger",
      fileName: "web-logger-js"
    },
    rollupOptions: {
      external: ['vue'],
    },
    target: "es2015"
  }
})
