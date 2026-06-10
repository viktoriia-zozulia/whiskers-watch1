import { Elysia } from 'elysia'
import { authService } from '../services/auth.service'
import { signToken } from '../utils/jwt'
import { registerBody, loginBody } from '../schemas/auth.schema'

export const authRoutes = new Elysia({ prefix: '/api/auth' })
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
      if (!user) return status(401, { error: 'Невірний email або пароль' })
      const valid = await authService.verifyPassword(body.password, user.password_hash)
      if (!valid) return status(401, { error: 'Невірний email або пароль' })
      const token = await signToken({ userId: user.id })
      return { token, user: { id: user.id, email: user.email, name: user.name } }
    },
    { body: loginBody },
  )
