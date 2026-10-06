// Browser entry point (referenced from index.html).
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { registerFonts } from './shared/lib/fonts'
import { App } from './app/App'

registerFonts()

const elem = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

if (import.meta.hot) {
  // Keep a single root across hot reloads in development.
  const root = (import.meta.hot.data.root ??= createRoot(elem))
  root.render(app)
} else {
  createRoot(elem).render(app)
}
