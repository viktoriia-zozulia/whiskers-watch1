import { t } from 'elysia'

export const createRecordBody = t.Object({
  record_type: t.String({ minLength: 1 }),
  text: t.Optional(t.String()),
  photo_url: t.Optional(t.String()),
})
