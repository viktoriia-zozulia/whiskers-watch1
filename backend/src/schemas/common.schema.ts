import { t } from 'elysia'

/** `:id` route param coerced to a positive integer ("abc" → 422, not a DB error). */
export const idParams = { params: t.Object({ id: t.Numeric({ minimum: 1 }) }) }
