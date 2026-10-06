// Development server: serves the SPA with hot reload and proxies /api/* to the
// backend. In production the backend serves the built bundle itself.
import { serve } from 'bun'
import index from './index.html'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001'

const server = serve({
  routes: {
    '/api/*': async (req: Request) => {
      const url = new URL(req.url)
      const isBodyless = req.method === 'GET' || req.method === 'HEAD'
      return fetch(`${BACKEND}${url.pathname}${url.search}`, {
        method: req.method,
        headers: req.headers,
        body: isBodyless ? undefined : await req.arrayBuffer(),
      })
    },
    '/*': index,
  },
  development: { hmr: true, console: true },
})

console.log(`🐾 WhiskersWatch dev → ${server.url}   (API → ${BACKEND})`)
