import { t } from 'elysia'

export const registerBody = t.Object({
  email: t.String({ minLength: 3 }),
  password: t.String({ minLength: 6 }),
  name: t.String({ minLength: 1 }),
})

export const loginBody = t.Object({
  email: t.String(),
  password: t.String(),
})

export const googleBody = t.Object({
  credential: t.String({ minLength: 1 }),
})
