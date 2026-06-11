import { Elysia } from 'elysia'
import { authService } from '../services/auth.service'
import { signToken } from '../utils/jwt'
import { config } from '../config/env'
import { registerBody, loginBody, googleBody } from '../schemas/auth.schema'

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  // Public config so the frontend knows whether to render the Google button.
  .get('/config', () => ({ googleClientId: config.googleClientId }))

  .post(
    '/register',
    async ({ body, status }) => {
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
    async ({ body, status }) => {
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
