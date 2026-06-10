import { db } from '../db'

export const settingsService = {
  getByUser(userId: number) {
    return db
      .selectFrom('user_settings')
      .where('user_id', '=', userId)
      .selectAll()
      .executeTakeFirst()
  },

  /** Updates settings, creating the row if it does not exist yet. */
  async upsert(userId: number, data: { push_enabled: boolean; email_enabled: boolean }) {
    const existing = await this.getByUser(userId)
    if (!existing) {
      return db
        .insertInto('user_settings')
        .values({ user_id: userId, ...data })
        .returningAll()
        .executeTakeFirstOrThrow()
    }
    return db
      .updateTable('user_settings')
      .set(data)
      .where('user_id', '=', userId)
      .returningAll()
      .executeTakeFirstOrThrow()
  },
}
