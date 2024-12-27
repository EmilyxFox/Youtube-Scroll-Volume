import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
        content: resolve(__dirname, 'src/content/content-script.ts'),
      },
      output: {
        entryFileNames: chunkInfo => {
          switch (chunkInfo.name) {
            case 'background': {
              return 'background/service-worker.js'
              break
            }
            case 'popup': {
              return 'popup/[name].[hash].js'
              break
            }
            case 'content': {
              return 'content/content-script.js'
              break
            }
            default:
              break
          }
          return chunkInfo.name === 'background' ? 'background/service-worker.js' : 'popup/[name].[hash].js'
        },
      },
    },
  },
  plugins: [svelte()],
})
