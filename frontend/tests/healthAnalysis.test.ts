import { describe, expect, test } from 'bun:test'
import type { Measurement, MedicalRecord, Pet, Task } from '../src/api'
import { computeHealthData } from '../src/features/home/healthAnalysis'

const now = new Date(2026, 9, 5, 12)
const ago = (days: number) => new Date(now.getTime() - days * 864e5).toISOString()
const pet: Pet = {
  id: 1, user_id: 1, name: 'Рекс', species: 'Собака', breed: null,
  birth_date: '2022-01-01', weight: 30, allergies: null, photo_url: null,
}
const record = (text: string, days: number, record_type = 'Нотатка'): MedicalRecord =>
  ({ id: Math.random(), pet_id: 1, record_date: ago(days), record_type, text, photo_url: null })
const weight = (kg: number, date: string): Measurement =>
  ({ id: Math.random(), pet_id: 1, date_measured: date, weight_kg: kg, notes: null })

const titles = (r: ReturnType<typeof computeHealthData>) => r.insights.map(i => i.title)

describe('WhiskersAI health analysis', () => {
  test('critical symptoms this week drop the score and surface first', () => {
    const r = computeHealthData(pet, [record('Було блювання зранку', 1)], [], [], now)
    expect(r.insights[0]!.sev).toBe('danger')
    expect(r.score).toBeLessThan(60)
  })

  test('detects weight loss between the last two weigh-ins', () => {
    const r = computeHealthData(pet, [], [], [weight(31, '2026-09-01'), weight(30.2, '2026-10-01')], now)
    expect(titles(r)).toContain('Зниження ваги')
  })

  test('stable weight is a good sign', () => {
    const r = computeHealthData(pet, [], [], [weight(30, '2026-09-01'), weight(30.1, '2026-10-01')], now)
    expect(titles(r)).toContain('Вага в нормі')
  })

  test('overdue tasks are reported with correct plural', () => {
    const overdue: Task[] = [1, 2].map(i => ({
      id: i, pet_id: 1, title: `Таблетка ${i}`, type: 'Ліки', task_time: ago(i), is_done: false,
    }))
    expect(titles(computeHealthData(pet, [], overdue, [], now))).toContain('Пропущено 2 завдання')
  })

  test('score is always clamped to 0–100', () => {
    const many = Array.from({ length: 10 }, (_, i) => record('кров, судоми, кашель', i % 6))
    const r = computeHealthData(pet, many, [], [weight(40, '2026-09-01'), weight(30, '2026-10-01')], now)
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.score).toBeLessThanOrEqual(100)
  })
})
