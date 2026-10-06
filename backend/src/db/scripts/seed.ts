import { db } from '../index'
import { hashPassword } from '../../utils/password'
import { authService } from '../../services/auth.service'
import { populateDemoData } from '../../services/demo.service'

const DEMO_EMAIL = 'demo@whiskers.app'

/**
 * Creates (or re-creates) a demo account with two pets and half a year of
 * realistic history. Login: demo@whiskers.app / demo1234. Safe to re-run.
 */
async function runSeed() {
  console.log('Starting database seeding...')

  try {
    await db.deleteFrom('users').where('email', '=', DEMO_EMAIL).execute()

    const user = await db
      .insertInto('users')
      .values({ email: DEMO_EMAIL, password_hash: await hashPassword('demo1234'), name: 'Вікторія' })
      .returning('id')
      .executeTakeFirstOrThrow()
    console.log(`User inserted with ID: ${user.id}`)

    await authService.createDefaultSettings(user.id)
    await populateDemoData(user.id)

    console.log(`Database seeding completed. Log in with ${DEMO_EMAIL} / demo1234`)
  } catch (error) {
    console.error('Seeding failed with error:', error)
    process.exitCode = 1
  } finally {
    await db.destroy()
  }
}

runSeed()
