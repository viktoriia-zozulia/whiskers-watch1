import { db } from '../db'
import { config } from '../config/env'
import { hashPassword, verifyPassword } from '../utils/password'

interface GoogleProfile {
  sub: string
  email: string
  name?: string
}

export const authService = {
  findByEmail(email: string) {
    return db.selectFrom('users').where('email', '=', email).selectAll().executeTakeFirst()
  },

  /** Creates a default settings row for a freshly created user. */
  createDefaultSettings(userId: number) {
    return db
      .insertInto('user_settings')
      .values({ user_id: userId, push_enabled: true, email_enabled: false })
      .execute()
  },

  /** Creates a user and their default settings row, returns the public user. */
  async register(data: { email: string; password: string; name: string }) {
    const password_hash = await hashPassword(data.password)
    const user = await db
      .insertInto('users')
      .values({ email: data.email, password_hash, name: data.name })
      .returning(['id', 'email', 'name'])
      .executeTakeFirstOrThrow()

    await this.createDefaultSettings(user.id)
    return user
  },

  /**
   * Verifies a Google ID token (the credential from Google Identity Services)
   * against Google's tokeninfo endpoint and checks it was issued for our app.
   */
  async verifyGoogleToken(credential: string): Promise<GoogleProfile | null> {
    if (!config.googleClientId) return null
    let res: Response
    try {
      res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`)
    } catch {
      return null
    }
    if (!res.ok) return null
    const data = (await res.json()) as Record<string, string>
    if (data.aud !== config.googleClientId) return null
    if (data.email_verified !== 'true') return null
    if (!data.sub || !data.email) return null
    return { sub: data.sub, email: data.email, name: data.name }
  },

  /**
   * Finds or creates a user for a verified Google profile, linking the
   * google_id to an existing email account when one already exists.
   */
  async findOrCreateGoogleUser(profile: GoogleProfile) {
    const existing = await this.findByEmail(profile.email)
    if (existing) {
      if (!existing.google_id) {
        await db.updateTable('users').set({ google_id: profile.sub }).where('id', '=', existing.id).execute()
      }
      return { id: existing.id, email: existing.email, name: existing.name }
    }
    const user = await db
      .insertInto('users')
      .values({
        email: profile.email,
        name: profile.name ?? profile.email.split('@')[0]!,
        password_hash: null,
        google_id: profile.sub,
      })
      .returning(['id', 'email', 'name'])
      .executeTakeFirstOrThrow()

    await this.createDefaultSettings(user.id)
    return user
  },

  verifyPassword,
}
