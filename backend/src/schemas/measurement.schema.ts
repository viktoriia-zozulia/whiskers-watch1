import { t } from 'elysia'

export const createMeasurementBody = t.Object({
  date_measured: t.String({ format: 'date' }),
  weight_kg: t.Number({ exclusiveMinimum: 0, maximum: 500 }),
  notes: t.Optional(t.String()),
})
