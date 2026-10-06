import { req } from '../client'
import type { UpdateSettingsDto, UserSettings } from './settings.models'

export const settingsApi = {
  get: () => req<UserSettings>('GET', '/api/settings'),
  update: (data: UpdateSettingsDto) => req<UserSettings>('PUT', '/api/settings', data),
}
