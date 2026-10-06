// Date / display formatting helpers shared across the app.

const pad = (n: number) => n.toString().padStart(2, '0')
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

/** Ukrainian plural form: plural(5, ['рік', 'роки', 'років']) → 'років'. */
export function plural(n: number, [one, few, many]: readonly [string, string, string]) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

/** Value for <input type="date"> in the user's local timezone (not UTC). */
export function toDateInput(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Value for <input type="datetime-local"> in the user's local timezone. */
export function toDateTimeInput(d = new Date()) {
  return `${toDateInput(d)}T${hhmm(d)}`
}

/** Parses a 'YYYY-MM-DD' DB date as a local calendar day (not UTC midnight). */
export function parseDateOnly(value: string) {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number)
  return new Date(y!, (m ?? 1) - 1, d ?? 1)
}

export function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
}

export function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff >= 0 && diff < 60_000) return 'Щойно'
  if (diff >= 0 && diff < 3_600_000) return `${Math.floor(diff / 60_000)} хв тому`
  if (isSameDay(d, now)) return `Сьогодні, ${hhmm(d)}`
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1)
  if (isSameDay(d, yesterday)) return `Вчора, ${hhmm(d)}`
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1)
  if (isSameDay(d, tomorrow)) return `Завтра, ${hhmm(d)}`
  return d.toLocaleDateString('uk-UA', {
    day: 'numeric', month: 'long',
    ...(d.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  })
}

/** Whole months between a birth date and `now`, respecting the day of month. */
export function ageInMonths(birth_date: string, now = new Date()) {
  const birth = parseDateOnly(birth_date)
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
  if (now.getDate() < birth.getDate()) months--
  return Math.max(0, months)
}

export function petAge(birth_date: string | null, now = new Date()): string {
  if (!birth_date) return '—'
  const months = ageInMonths(birth_date, now)
  if (months < 1) return 'до 1 міс.'
  if (months < 12) return `${months} міс.`
  const years = Math.floor(months / 12)
  return `${years} ${plural(years, ['рік', 'роки', 'років'])}`
}

export function speciesEmoji(species?: string) {
  if (species === 'Кіт') return '🐱'
  if (species === 'Собака') return '🐶'
  if (species === 'Птах') return '🐦'
  if (species === 'Кролик') return '🐰'
  return '🐾'
}
