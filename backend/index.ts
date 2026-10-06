import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { config } from './src/config/env'
import { errorHandler } from './src/middlewares/errors'
import { routes } from './src/routes'
import { staticSite } from './src/middlewares/staticSite'

const app = new Elysia()

// Hooks only apply to routes registered after them, so CORS goes first.
if (config.corsOrigins.length > 0) app.use(cors({ origin: config.corsOrigins }))

app
  .use(errorHandler)
  .get('/api/health', () => ({ ok: true }))
  .use(routes)

// In production the same process serves the built frontend.
if (config.staticDir) app.use(staticSite(config.staticDir))

app.listen(config.port)

console.log(`🐾 WhiskersWatch ${config.staticDir ? 'app' : 'API'} running at http://localhost:${app.server?.port}`)
