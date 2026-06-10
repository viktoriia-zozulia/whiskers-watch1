import { db } from '../index'
import { hashPassword } from '../../utils/password'

/**
 * Inserts one demo user (login: demo@whiskers.app / password: demo1234)
 * together with a pet and sample data, so the app can be explored immediately.
 */
async function runSeed() {
  console.log('Starting database seeding...')

  try {
    const password_hash = await hashPassword('demo1234')

    const user = await db
      .insertInto('users')
      .values({ email: 'demo@whiskers.app', password_hash, name: 'Вікторія' })
      .returning('id')
      .executeTakeFirstOrThrow()
    const userId = user.id
    console.log(`User inserted with ID: ${userId}`)

    await db
      .insertInto('user_settings')
      .values({ user_id: userId, push_enabled: true, email_enabled: false })
      .execute()
    console.log('User settings inserted.')

    await db
      .insertInto('vet_contacts')
      .values({ user_id: userId, doc_name: 'Др. Олена Кравченко', clinic: 'Ветклініка «Лапа»', phone: '+380501234567' })
      .execute()
    console.log('Vet contact inserted.')

    const pet = await db
      .insertInto('pets')
      .values({
        user_id: userId,
        name: 'Сніжок',
        species: 'Кіт',
        breed: 'Шотландська капловуха',
        birth_date: '2021-04-12',
        weight: 4.5,
        allergies: 'Алергія на курку. Чутливе травлення.',
      })
      .returning('id')
      .executeTakeFirstOrThrow()
    const petId = pet.id
    console.log(`Pet inserted with ID: ${petId}`)

    await db
      .insertInto('tasks')
      .values([
        { pet_id: petId, title: 'Дати вітаміни', type: 'Ліки', task_time: new Date(), is_done: false },
        { pet_id: petId, title: 'Почистити вуха', type: 'Догляд', task_time: new Date(), is_done: true },
        { pet_id: petId, title: 'Комплексне щеплення', type: 'Вакцина', task_time: new Date(Date.now() + 7 * 864e5), is_done: false },
      ])
      .execute()
    console.log('Tasks inserted.')

    await db
      .insertInto('medical_records')
      .values({
        pet_id: petId,
        record_date: new Date(),
        record_type: 'Нотатка',
        text: 'Трохи млявий зранку, відмовився від сухого корму, але пив воду в нормі.',
      })
      .execute()
    console.log('Medical record inserted.')

    await db
      .insertInto('measurements')
      .values({ pet_id: petId, date_measured: '2026-05-01', weight_kg: 4.5, notes: 'Планове щомісячне зважування.' })
      .execute()
    console.log('Weight measurement inserted.')

    console.log('Database seeding completed successfully.')
  } catch (error) {
    console.error('Seeding failed with error:', error)
  } finally {
    await db.destroy()
  }
}

runSeed()
