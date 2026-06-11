import { Elysia } from 'elysia'
import { authMiddleware } from '../middlewares/auth'
import { notificationService } from '../services/notification.service'
import { isSmtpEnabled } from '../config/env'

export const notificationRoutes = new Elysia()
  .use(authMiddleware)

  // Whether the server can actually send email (SMTP configured).
  .get('/api/notifications/status', () => ({ emailConfigured: isSmtpEnabled() }))

  // Sends the weekly digest to the logged-in user's email.
  .post('/api/notifications/send-digest', async ({ userId, status }) => {
    try {
      return await notificationService.sendDigest(userId!)
    } catch (e) {
      return status(400, { error: e instanceof Error ? e.message : 'Не вдалося надіслати лист' })
    }
  })
