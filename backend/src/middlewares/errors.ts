import { Elysia } from 'elysia'

/**
 * Global error handler. Converts framework/runtime errors into friendly,
 * Ukrainian-language JSON responses. Explicit `status(...)` returns from
 * handlers (401/404/409/...) pass through untouched.
 */
export const errorHandler = new Elysia({ name: 'errors' }).onError(
  { as: 'global' },
  ({ code, error, status }) => {
    if (code === 'VALIDATION')
      return status(422, { error: 'Перевірте правильність введених даних.' })
    if (code === 'NOT_FOUND')
      return status(404, { error: 'Сторінку не знайдено.' })
    console.error('Server error:', error)
    return status(500, { error: 'Сталася помилка на сервері. Спробуйте пізніше.' })
  },
)
