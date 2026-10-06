import { Elysia } from 'elysia'
import { authService } from '../services/auth.service'
import { demoService } from '../services/demo.service'
import { authMiddleware } from '../middlewares/auth'
import { signToken } from '../utils/jwt'
import { clientIp, createRateLimiter } from '../utils/rateLimit'
import { config } from '../config/env'
import { registerBody, loginBody, googleBody } from '../schemas/auth.schema'

const MINUTE = 60_000
const loginLimiter = createRateLimiter({ max: 10, windowMs: 15 * MINUTE })
const signupLimiter = createRateLimiter({ max: 5, windowMs: 60 * MINUTE })
const demoLimiter = createRateLimiter({ max: 10, windowMs: 60 * MINUTE })
const TOO_MANY = { error: 'Забагато спроб. Спробуйте трохи пізніше.' }

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  // Public config so the frontend knows which sign-in options to render.
  .get('/config', () => ({ googleClientId: config.googleClientId, demoEnabled: config.demoEnabled }))

  .post(
    '/register',
    async ({ body, status, request, server }) => {
      if (!signupLimiter.hit(clientIp(request, server))) return status(429, TOO_MANY)
      const existing = await authService.findByEmail(body.email)
      if (existing) return status(409, { error: 'Ця електронна пошта вже використовується' })
      const user = await authService.register(body)
      const token = await signToken({ userId: user.id })
      return { token, user }
    },
    { body: registerBody },
  )
  .post(
    '/login',
    async ({ body, status, request, server }) => {
      // Keyed by IP + email: slows down guessing one account's password
      // without locking everyone behind a shared IP out.
      if (!loginLimiter.hit(`${clientIp(request, server)}|${body.email.toLowerCase()}`)) return status(429, TOO_MANY)
      const user = await authService.findByEmail(body.email)
      if (!user || !user.password_hash) return status(401, { error: 'Невірний email або пароль' })
      const valid = await authService.verifyPassword(body.password, user.password_hash)
      if (!valid) return status(401, { error: 'Невірний email або пароль' })
      const token = await signToken({ userId: user.id })
      return { token, user: { id: user.id, email: user.email, name: user.name } }
    },
    { body: loginBody },
  )
  .post(
    '/google',
    async ({ body, status }) => {
      if (!config.googleClientId) return status(503, { error: 'Вхід через Google не налаштовано на сервері' })
      const profile = await authService.verifyGoogleToken(body.credential)
      if (!profile) return status(401, { error: 'Не вдалося підтвердити вхід через Google' })
      const user = await authService.findOrCreateGoogleUser(profile)
      const token = await signToken({ userId: user.id })
      return { token, user }
    },
    { body: googleBody },
  )

  // One click → a private sandbox account pre-filled with realistic data.
  .post('/demo', async ({ status, request, server }) => {
    if (!config.demoEnabled) return status(404, { error: 'Демо-режим вимкнено' })
    if (!demoLimiter.hit(clientIp(request, server))) return status(429, TOO_MANY)
    const user = await demoService.createSandbox()
    const token = await signToken({ userId: user.id })
    return { token, user: { ...user, is_demo: true } }
  })

  // Restores the session on page reload.
  .use(authMiddleware)
  .get('/me', async ({ userId, status }) => {
    const user = await authService.findPublicById(userId!)
    if (!user) return status(401, { error: 'Сесію завершено. Увійдіть знову.' })
    return user
  })
