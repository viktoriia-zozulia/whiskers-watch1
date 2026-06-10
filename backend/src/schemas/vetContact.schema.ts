import { t } from 'elysia'

export const createVetContactBody = t.Object({
  doc_name: t.Optional(t.String()),
  clinic: t.String({ minLength: 1 }),
  phone: t.Optional(t.String()),
})

export const updateVetContactBody = t.Object({
  doc_name: t.Optional(t.Nullable(t.String())),
  clinic: t.Optional(t.String()),
  phone: t.Optional(t.Nullable(t.String())),
})
