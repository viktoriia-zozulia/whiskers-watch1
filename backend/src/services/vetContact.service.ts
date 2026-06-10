import { db } from '../db'

interface VetContactInput {
  doc_name?: string | null
  clinic: string
  phone?: string | null
}

export const vetContactService = {
  listByUser(userId: number) {
    return db
      .selectFrom('vet_contacts')
      .where('user_id', '=', userId)
      .selectAll()
      .orderBy('id', 'desc')
      .execute()
  },

  findOwned(id: number, userId: number) {
    return db
      .selectFrom('vet_contacts')
      .where('id', '=', id)
      .where('user_id', '=', userId)
      .selectAll()
      .executeTakeFirst()
  },

  create(userId: number, data: VetContactInput) {
    return db
      .insertInto('vet_contacts')
      .values({
        user_id: userId,
        doc_name: data.doc_name ?? null,
        clinic: data.clinic,
        phone: data.phone ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  update(id: number, data: Partial<VetContactInput>) {
    return db
      .updateTable('vet_contacts')
      .set(data)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  remove(id: number) {
    return db.deleteFrom('vet_contacts').where('id', '=', id).execute()
  },
}
