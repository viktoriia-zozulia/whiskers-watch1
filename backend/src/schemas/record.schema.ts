import { t } from 'elysia'

export const createRecordBody = t.Object({
  record_type: t.String({ minLength: 1 }),
  text: t.Optional(t.String()),
  photo_url: t.Optional(t.String()),
})

// Optional server-side filters for the medical history listing.
export const listRecordsQuery = t.Object({
  type: t.Optional(t.String()),
  search: t.Optional(t.String()),
})
