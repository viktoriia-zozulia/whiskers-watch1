import { t } from 'elysia'

export const createPetBody = t.Object({
  name: t.String({ minLength: 1 }),
  species: t.String({ minLength: 1 }),
  breed: t.Optional(t.Nullable(t.String())),
  birth_date: t.Optional(t.Nullable(t.String({ format: 'date' }))),
  weight: t.Optional(t.Nullable(t.Number({ minimum: 0, maximum: 500 }))),
  allergies: t.Optional(t.Nullable(t.String())),
  photo_url: t.Optional(t.Nullable(t.String())),
})

export const updatePetBody = t.Object({
  name: t.Optional(t.String({ minLength: 1 })),
  species: t.Optional(t.String({ minLength: 1 })),
  breed: t.Optional(t.Nullable(t.String())),
  birth_date: t.Optional(t.Nullable(t.String({ format: 'date' }))),
  weight: t.Optional(t.Nullable(t.Number({ minimum: 0, maximum: 500 }))),
  allergies: t.Optional(t.Nullable(t.String())),
  photo_url: t.Optional(t.Nullable(t.String())),
})
