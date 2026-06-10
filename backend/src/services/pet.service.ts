import { db } from '../db'

interface PetInput {
  name: string
  species: string
  breed?: string | null
  birth_date?: string | null
  weight?: number | null
  allergies?: string | null
  photo_url?: string | null
}

export const petService = {
  listByUser(userId: number) {
    return db.selectFrom('pets').where('user_id', '=', userId).selectAll().execute()
  },

  /** Returns the pet only if it belongs to the given user (else undefined). */
  findOwned(id: number, userId: number) {
    return db
      .selectFrom('pets')
      .where('id', '=', id)
      .where('user_id', '=', userId)
      .selectAll()
      .executeTakeFirst()
  },

  create(userId: number, data: PetInput) {
    return db
      .insertInto('pets')
      .values({
        user_id: userId,
        name: data.name,
        species: data.species,
        breed: data.breed ?? null,
        birth_date: data.birth_date ?? null,
        weight: data.weight ?? null,
        allergies: data.allergies ?? null,
        photo_url: data.photo_url ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  update(id: number, data: Partial<PetInput>) {
    return db
      .updateTable('pets')
      .set(data)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  remove(id: number) {
    return db.deleteFrom('pets').where('id', '=', id).execute()
  },
}
