import { Elysia } from 'elysia'
import { authMiddleware } from '../middlewares/auth'
import { settingsService } from '../services/settings.service'
import { updateSettingsBody } from '../schemas/settings.schema'

export const settingsRoutes = new Elysia({ prefix: '/api/settings' })
  .use(authMiddleware)

  .get('/', async ({ userId, status }) => {
    const settings = await settingsService.getByUser(userId!)
    if (!settings) return status(404, { error: 'Налаштування не знайдено' })
    return settings
  })

  .put('/', ({ userId, body }) => settingsService.upsert(userId!, body), {
    body: updateSettingsBody,
  })
