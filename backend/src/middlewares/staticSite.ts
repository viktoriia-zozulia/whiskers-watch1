import { Elysia } from 'elysia'
import path from 'node:path'

const HASHED = /-[a-z0-9]{8}\.[a-z0-9]+$/ // e.g. chunk-9azntn81.js, onest-latin-…-7kxh2f5k.woff2

/**
 * Serves the built frontend (frontend/dist) from the API process, so the
 * whole app deploys as a single web service on one origin — no CORS, no proxy.
 * Fingerprinted assets are cached forever; everything else falls back to
 * index.html (the SPA uses hash routing).
 */
export function staticSite(dir: string) {
  const root = path.resolve(dir)
  const indexHtml = () => new Response(Bun.file(path.join(root, 'index.html')), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' },
  })

  return new Elysia({ name: 'static-site' })
    .get('/', indexHtml)
    .get('/*', async ({ params, status }) => {
      const rel = params['*']
      if (rel.startsWith('api/')) return status(404, { error: 'Не знайдено' })

      const filePath = path.resolve(root, rel)
      if (filePath.startsWith(root + path.sep)) {
        const file = Bun.file(filePath)
        if (await file.exists()) {
          return new Response(file, {
            headers: { 'Cache-Control': HASHED.test(rel) ? 'public, max-age=31536000, immutable' : 'public, max-age=3600' },
          })
        }
      }
      return indexHtml()
    })
}
