import { t } from 'elysia'

export const createPetBody = t.Object({
  name: t.String({ minLength: 1 }),
  species: t.String({ minLength: 1 }),
  breed: t.Optional(t.String()),
  birth_date: t.Optional(t.String()),
  weight: t.Optional(t.Number()),
  allergies: t.Optional(t.String()),
  photo_url: t.Optional(t.String()),
})

export const updatePetBody = t.Object({
  name: t.Optional(t.String()),
  species: t.Optional(t.String()),
  breed: t.Optional(t.Nullable(t.String())),
  birth_date: t.Optional(t.Nullable(t.String())),
  weight: t.Optional(t.Nullable(t.Number())),
  allergies: t.Optional(t.Nullable(t.String())),
  photo_url: t.Optional(t.Nullable(t.String())),
})

export const idParam = t.Object({ id: t.String() })
