import { t } from 'elysia'
import { config } from '../config/env'

export const uploadBody = t.Object({
  file: t.File({ type: 'image', maxSize: config.maxUploadSize }),
})
