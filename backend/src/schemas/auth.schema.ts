import { t } from 'elysia'

export const registerBody = t.Object({
  email: t.String({ format: 'email', maxLength: 254 }),
  password: t.String({ minLength: 6, maxLength: 72 }),
  name: t.String({ minLength: 1, maxLength: 80 }),
})

export const loginBody = t.Object({
  email: t.String(),
  password: t.String(),
})

export const googleBody = t.Object({
  credential: t.String({ minLength: 1 }),
})
