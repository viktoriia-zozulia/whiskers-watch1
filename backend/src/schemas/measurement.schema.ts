import { t } from 'elysia'

export const createMeasurementBody = t.Object({
  date_measured: t.String(),
  weight_kg: t.Number(),
  notes: t.Optional(t.String()),
})
