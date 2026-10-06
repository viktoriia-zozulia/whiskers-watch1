import { req } from '../client'
import type { DigestResult, NotificationStatus } from './notification.models'

export const notificationsApi = {
  status: () => req<NotificationStatus>('GET', '/api/notifications/status'),
  sendDigest: () => req<DigestResult>('POST', '/api/notifications/send-digest'),
}
