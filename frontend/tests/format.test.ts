import { describe, expect, test } from 'bun:test'
import { ageInMonths, petAge, plural, toDateInput, toDateTimeInput } from '../src/shared/lib/format'

describe('plural (Ukrainian)', () => {
  const years = ['рік', 'роки', 'років'] as const
  test.each([
    [1, 'рік'], [2, 'роки'], [4, 'роки'], [5, 'років'], [11, 'років'],
    [12, 'років'], [14, 'років'], [21, 'рік'], [22, 'роки'], [25, 'років'],
  ])('%i → %s', (n, form) => expect(plural(n, years)).toBe(form))
})

describe('petAge', () => {
  const now = new Date(2026, 9, 5) // 5 Oct 2026

  test('counts full months, respecting the day of month', () => {
    expect(ageInMonths('2026-09-06', now)).toBe(0)
    expect(ageInMonths('2026-09-05', now)).toBe(1)
  })

  test('formats years with the right plural form', () => {
    expect(petAge('2021-04-12', now)).toBe('5 років')
    expect(petAge('2024-10-05', now)).toBe('2 роки')
    expect(petAge('2005-01-01', now)).toBe('21 рік')
  })

  test('handles young, missing and future dates', () => {
    expect(petAge('2026-07-01', now)).toBe('3 міс.')
    expect(petAge('2026-10-01', now)).toBe('до 1 міс.')
    expect(petAge(null, now)).toBe('—')
    expect(petAge('2027-01-01', now)).toBe('до 1 міс.')
  })
})

describe('date inputs use local time, not UTC', () => {
  test('late evening stays on the same calendar day', () => {
    const lateEvening = new Date(2026, 9, 5, 23, 30)
    expect(toDateInput(lateEvening)).toBe('2026-10-05')
    expect(toDateTimeInput(lateEvening)).toBe('2026-10-05T23:30')
  })
})
