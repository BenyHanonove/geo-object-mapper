import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const r = (relativePath: string) => path.resolve(rootDir, relativePath)
const buildId = process.env.BUILD_ID ?? 'v1'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@plugins': r('./src/config'),
      '@stores': r('./src/config/store'),
      '@router': r('./src/config/router'),
      '@shared': r('./src/modules/shared'),
      '@polygons': r('./src/modules/polygons'),
      '@objects': r('./src/modules/objects'),
      '@map': r('./src/modules/map'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  build: {
    assetsDir: `assets/${buildId}`,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|react-router)/ },
            { name: 'vendor-mui', test: /node_modules[\\/](@mui|@emotion)/ },
            { name: 'vendor-leaflet', test: /node_modules[\\/](leaflet|react-leaflet)/ },
          ],
        },
      },
    },
  },
})
