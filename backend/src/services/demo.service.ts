import { db } from '../db'
import { config } from '../config/env'
import { authService } from './auth.service'

/** A local Date `days` from today at hh:mm — keeps demo data always "fresh". */
function at(days: number, hours = 12, minutes = 0) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hours, minutes, 0, 0)
  return d
}

/** Local calendar date (YYYY-MM-DD) `days` from today. */
function dateOnly(days: number) {
  const d = at(days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function yearsAgo(years: number, month: number, day: number) {
  return `${new Date().getFullYear() - years}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * Fills an account with a realistic half-year history for two pets, so every
 * screen (WhiskersAI, weight chart, timeline, streak) has something to show.
 * All dates are relative to "now", so the demo never looks stale.
 */
export async function populateDemoData(userId: number) {
  await db.insertInto('vet_contacts').values([
    { user_id: userId, doc_name: 'Др. Олена Кравченко', clinic: 'Ветклініка «Лапа»', phone: '+380501234567' },
    { user_id: userId, doc_name: null, clinic: 'Цілодобова ветлікарня «Хвіст»', phone: '+380441112233' },
  ]).execute()

  // ── Сніжок: healthy cat, stable weight, recovering from a mild cold ─────────
  const snow = await db.insertInto('pets').values({
    user_id: userId,
    name: 'Сніжок',
    species: 'Кіт',
    breed: 'Шотландська капловуха',
    birth_date: yearsAgo(4, 4, 12),
    weight: 4.55,
    allergies: 'Алергія на курку. Чутливе травлення.',
    photo_url: null,
  }).returning('id').executeTakeFirstOrThrow()

  const snowWeights = [4.1, 4.2, 4.35, 4.4, 4.5, 4.6, 4.55]
  await db.insertInto('measurements').values(snowWeights.map((w, i) => ({
    pet_id: snow.id,
    date_measured: dateOnly(-(snowWeights.length - 1 - i) * 30),
    weight_kg: w,
    notes: i === 0 ? 'Перше зважування після переїзду' : i === snowWeights.length - 1 ? 'Планове щомісячне зважування' : null,
  }))).execute()

  await db.insertInto('medical_records').values([
    { pet_id: snow.id, record_date: at(-170, 11), record_type: 'Вакцина', text: 'Комплексна вакцинація (Nobivac Tricat Trio). Наступна — через рік.', photo_url: null },
    { pet_id: snow.id, record_date: at(-120, 16), record_type: 'Лікар', text: 'Плановий огляд у др. Кравченко. Зуби в нормі, рекомендовано контроль ваги.', photo_url: null },
    { pet_id: snow.id, record_date: at(-60, 10), record_type: 'Ліки', text: 'Обробка від бліх та кліщів (Bravecto).', photo_url: null },
    { pet_id: snow.id, record_date: at(-21, 8, 30), record_type: 'Симптом', text: 'Чхання зранку, очі трохи сльозяться.', photo_url: null },
    { pet_id: snow.id, record_date: at(-18, 15), record_type: 'Лікар', text: 'Огляд: легкий риніт, призначено промивання очей. Без антибіотиків.', photo_url: null },
    { pet_id: snow.id, record_date: at(-3, 19), record_type: 'Нотатка', text: 'Грається з новою іграшкою-вудкою, апетит чудовий 😺', photo_url: null },
    { pet_id: snow.id, record_date: new Date(Date.now() - 2 * 3600e3), record_type: 'Нотатка', text: 'Зранку з’їв гіпоалергенний корм, настрій грайливий.', photo_url: null },
  ]).execute()

  // A week of fully completed days builds a visible care streak.
  const pastDays = Array.from({ length: 6 }, (_, i) => -(i + 1)).flatMap(d => [
    { pet_id: snow.id, title: 'Краплі для очей', type: 'Ліки', task_time: at(d, 9), is_done: true },
    { pet_id: snow.id, title: 'Вечірні вітаміни', type: 'Ліки', task_time: at(d, 19), is_done: true },
  ])
  await db.insertInto('tasks').values([
    ...pastDays,
    { pet_id: snow.id, title: 'Гіпоалергенний сніданок', type: 'Догляд', task_time: at(0, 8), is_done: true },
    { pet_id: snow.id, title: 'Краплі для очей', type: 'Ліки', task_time: at(0, 9), is_done: true },
    { pet_id: snow.id, title: 'Вечірні вітаміни', type: 'Ліки', task_time: at(0, 19), is_done: false },
    { pet_id: snow.id, title: 'Почистити лоток', type: 'Догляд', task_time: at(0, 21), is_done: false },
    { pet_id: snow.id, title: 'Контрольний огляд у ветеринара', type: 'Лікар', task_time: at(5, 10, 30), is_done: false },
    { pet_id: snow.id, title: 'Ревакцинація від сказу', type: 'Вакцина', task_time: at(12, 11), is_done: false },
  ]).execute()

  // ── Рекс: senior dog with a weight drop and a missed pill (lower score) ─────
  const rex = await db.insertInto('pets').values({
    user_id: userId,
    name: 'Рекс',
    species: 'Собака',
    breed: 'Золотистий ретривер',
    birth_date: yearsAgo(8, 9, 3),
    weight: 31.2,
    allergies: null,
    photo_url: null,
  }).returning('id').executeTakeFirstOrThrow()

  const rexWeights = [32.4, 32.6, 32.1, 31.8, 31.2]
  await db.insertInto('measurements').values(rexWeights.map((w, i) => ({
    pet_id: rex.id,
    date_measured: dateOnly(-(rexWeights.length - 1 - i) * 30),
    weight_kg: w,
    notes: i === rexWeights.length - 1 ? 'Став менше їсти ввечері' : null,
  }))).execute()

  await db.insertInto('medical_records').values([
    { pet_id: rex.id, record_date: at(-400, 12), record_type: 'Лікар', text: 'Річний огляд: суглоби у межах вікової норми.', photo_url: null },
    { pet_id: rex.id, record_date: at(-200, 10), record_type: 'Вакцина', text: 'Щеплення від сказу та комплексне (DHPPi+L).', photo_url: null },
    { pet_id: rex.id, record_date: at(-9, 18), record_type: 'Нотатка', text: 'Довга прогулянка в парку, плавав у озері 🦮', photo_url: null },
    { pet_id: rex.id, record_date: at(-2, 20), record_type: 'Симптом', text: 'Трохи кульгає на задню ліву лапу після прогулянки.', photo_url: null },
  ]).execute()

  await db.insertInto('tasks').values([
    { pet_id: rex.id, title: 'Таблетка від глистів', type: 'Ліки', task_time: at(-1, 9), is_done: false },
    { pet_id: rex.id, title: 'Прогулянка 40 хв', type: 'Догляд', task_time: at(0, 7, 30), is_done: true },
    { pet_id: rex.id, title: 'Хондропротектор', type: 'Ліки', task_time: at(0, 13), is_done: false },
    { pet_id: rex.id, title: 'Огляд ортопеда', type: 'Лікар', task_time: at(3, 17), is_done: false },
  ]).execute()
}

export const demoService = {
  /** Creates a fresh, isolated demo account so visitors never see each other's edits. */
  async createSandbox() {
    await this.purgeExpired()

    const suffix = crypto.randomUUID().slice(0, 8)
    const user = await db.insertInto('users').values({
      email: `guest-${suffix}@demo.whiskerswatch.app`,
      name: 'Гість',
      password_hash: null,
      google_id: null,
      is_demo: true,
    }).returning(['id', 'email', 'name']).executeTakeFirstOrThrow()

    await authService.createDefaultSettings(user.id)
    await populateDemoData(user.id)
    return user
  },

  /** Deletes demo accounts older than the TTL (their data cascades). */
  purgeExpired() {
    const cutoff = new Date(Date.now() - config.demoTtlHours * 3600e3)
    return db.deleteFrom('users')
      .where('is_demo', '=', true)
      .where('created_at', '<', cutoff)
      .execute()
  },
}

