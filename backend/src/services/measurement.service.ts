import { db } from '../db'

export const measurementService = {
  listByPet(petId: number) {
    return db
      .selectFrom('measurements')
      .where('pet_id', '=', petId)
      .selectAll()
      .orderBy('date_measured', 'desc')
      .execute()
  },

  /** Inserts a weight measurement and syncs the pet's current weight. */
  async create(petId: number, data: { date_measured: string; weight_kg: number; notes?: string }) {
    const measurement = await db
      .insertInto('measurements')
      .values({
        pet_id: petId,
        date_measured: data.date_measured,
        weight_kg: data.weight_kg,
        notes: data.notes ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    await db
      .updateTable('pets')
      .set({ weight: data.weight_kg })
      .where('id', '=', petId)
      .execute()

    return measurement
  },
}
