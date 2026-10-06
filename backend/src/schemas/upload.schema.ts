import { t } from 'elysia'
import { config } from '../config/env'
import { ALLOWED_IMAGE_TYPES } from '../services/upload.service'

export const uploadBody = t.Object({
  file: t.File({ type: ALLOWED_IMAGE_TYPES, maxSize: config.maxUploadSize }),
})
