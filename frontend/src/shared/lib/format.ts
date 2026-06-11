// Date / display formatting helpers shared across the app.

export function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff >= 0 && diff < 60_000) return 'Щойно'
  if (diff >= 0 && diff < 3_600_000) return `${Math.floor(diff / 60_000)} хв тому`
  if (d.toDateString() === now.toDateString()) {
    return `Сьогодні, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) {
    return `Вчора, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })
}

export function petAge(birth_date: string | null): string {
  if (!birth_date) return '—'
  const birth = new Date(birth_date)
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
  if (months < 12) return `${months} міс.`
  const years = Math.floor(months / 12)
  return `${years} ${years === 1 ? 'рік' : years < 5 ? 'роки' : 'років'}`
}

export function speciesEmoji(species?: string) {
  if (species === 'Кіт') return '🐱'
  if (species === 'Собака') return '🐶'
  if (species === 'Птах') return '🐦'
  if (species === 'Кролик') return '🐰'
  return '🐾'
}
