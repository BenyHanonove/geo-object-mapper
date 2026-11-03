import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { env } from '@plugins'
import App from './App'

document.documentElement.dir = env.app.dir

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
