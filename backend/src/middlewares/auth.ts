import { Elysia } from 'elysia'
import { verifyToken } from '../utils/jwt'

/**
 * Auth middleware.
 *
 * `derive` extracts and verifies the Bearer token, exposing `userId` on the
 * context. The `onBeforeHandle` guard rejects unauthenticated requests so that
 * every protected route handler can rely on `userId` being a valid number.
 *
 * Scoped (`as: 'scoped'`) so both the derive and the guard propagate to the
 * parent instance that mounts this plugin via `.use(...)`.
 */
export const authMiddleware = new Elysia({ name: 'auth' })
  .derive({ as: 'scoped' }, async ({ headers }) => {
    const header = headers['authorization']
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null
    const payload = token ? await verifyToken(token) : null
    return { userId: payload?.userId ?? null }
  })
  .onBeforeHandle({ as: 'scoped' }, ({ userId, status }) => {
    if (!userId) return status(401, { error: 'Потрібна авторизація' })
  })
