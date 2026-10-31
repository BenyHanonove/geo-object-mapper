import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { env } from '@plugins'
import { reloadOnceAfterChunkFailure } from '@router'
import App from './App'

// Guarded one-time reload on stale lazy chunk after deployment
window.addEventListener('vite:preloadError', (event) => {
  if (reloadOnceAfterChunkFailure()) event.preventDefault()
})

document.documentElement.dir = env.app.dir

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
