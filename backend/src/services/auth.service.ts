import { db } from '../db'
import { hashPassword, verifyPassword } from '../utils/password'

export const authService = {
  findByEmail(email: string) {
    return db.selectFrom('users').where('email', '=', email).selectAll().executeTakeFirst()
  },

  /** Creates a user and their default settings row, returns the public user. */
  async register(data: { email: string; password: string; name: string }) {
    const password_hash = await hashPassword(data.password)
    const user = await db
      .insertInto('users')
      .values({ email: data.email, password_hash, name: data.name })
      .returning(['id', 'email', 'name'])
      .executeTakeFirstOrThrow()

    await db
      .insertInto('user_settings')
      .values({ user_id: user.id, push_enabled: true, email_enabled: false })
      .execute()

    return user
  },

  verifyPassword,
}
