import { serve } from 'bun'
import index from './index.html'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001'

const server = serve({
  routes: {
    // Proxy all /api/* requests to the backend
    '/api/*': async (req: Request) => {
      const url = new URL(req.url)
      const backendUrl = `${BACKEND}${url.pathname}${url.search}`

      const isBodyless = req.method === 'GET' || req.method === 'HEAD'
      return fetch(backendUrl, {
        method: req.method,
        headers: req.headers,
        body: isBodyless ? undefined : await req.arrayBuffer(),
      })
    },

    // Serve the React SPA for all other routes
    '/*': index,
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
})

console.log(`🐾 WhiskersWatch frontend → ${server.url}   (API proxy → ${BACKEND})`)
