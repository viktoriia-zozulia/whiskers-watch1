import { t } from 'elysia'

export const updateSettingsBody = t.Object({
  push_enabled: t.Boolean(),
  email_enabled: t.Boolean(),
})
