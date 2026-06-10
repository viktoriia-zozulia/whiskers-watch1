import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { config } from './src/config/env'
import { errorHandler } from './src/middlewares/errors'
import { routes } from './src/routes'

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .use(errorHandler)
  .get('/api/health', () => ({ ok: true }))
  .use(routes)
  .listen(config.port)

console.log(`🐾 WhiskersWatch API running at http://localhost:${app.server?.port}`)

export type App = typeof app
