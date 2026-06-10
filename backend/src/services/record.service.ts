import { db } from '../db'

export const recordService = {
  listByPet(petId: number) {
    return db
      .selectFrom('medical_records')
      .where('pet_id', '=', petId)
      .selectAll()
      .orderBy('record_date', 'desc')
      .execute()
  },

  create(petId: number, data: { record_type: string; text?: string; photo_url?: string }) {
    return db
      .insertInto('medical_records')
      .values({
        pet_id: petId,
        record_date: new Date(),
        record_type: data.record_type,
        text: data.text ?? '',
        photo_url: data.photo_url ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  /** Returns the record id only if it belongs to the user. */
  findOwned(recordId: number, userId: number) {
    return db
      .selectFrom('medical_records')
      .innerJoin('pets', 'pets.id', 'medical_records.pet_id')
      .where('medical_records.id', '=', recordId)
      .where('pets.user_id', '=', userId)
      .select('medical_records.id')
      .executeTakeFirst()
  },

  remove(recordId: number) {
    return db.deleteFrom('medical_records').where('id', '=', recordId).execute()
  },
}
