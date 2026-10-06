import type { Measurement, MedicalRecord, Pet, Task } from '../../api'
import { ageInMonths, plural } from '../../shared/lib/format'

// Rule-based "WhiskersAI" engine: derives a 0–100 health score and a list of
// human-readable insights from the pet's medical card (profile + allergies),
// full record history, scheduled tasks and weight measurements. Runs entirely
// on the client — no external API needed.

export type InsightSev = 'good' | 'info' | 'warning' | 'danger'
export interface Insight { sev: InsightSev; title: string; desc: string }

export const insightCfg: Record<InsightSev, { bg: string; border: string; emoji: string; text: string }> = {
  good:    { bg: 'bg-teal-50',  border: 'border-teal-200',  emoji: '✅', text: 'text-teal-700' },
  info:    { bg: 'bg-blue-50',  border: 'border-blue-200',  emoji: 'ℹ️',  text: 'text-blue-700' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', emoji: '⚠️', text: 'text-amber-700' },
  danger:  { bg: 'bg-red-50',   border: 'border-red-200',   emoji: '🚨', text: 'text-red-700' },
}

const DAY = 864e5

const CRITICAL_KW = ['блювання', 'кров', 'судоми', 'не дихає', 'параліч', 'отрут']
const WARN_KW = ['кашель', 'чхання', 'млявість', 'не їсть', 'свербіж', 'хрипить', 'температур', 'діаре', 'пронос', 'кульга']
const VET_KW = ['лікар', 'клінік', 'ветеринар', 'огляд', 'прийом']

export function computeHealthData(
  pet: Pet, records: MedicalRecord[], tasks: Task[], measurements: Measurement[],
  now = new Date(),
): { score: number; insights: Insight[] } {
  const daysAgo = (iso: string) => Math.floor((now.getTime() - new Date(iso).getTime()) / DAY)
  let score = 80
  const insights: Insight[] = []
  const lower = (s: string | null | undefined) => (s ?? '').toLowerCase()

  // ── Weight trend (last two measurements) ─────────────────────────────────────
  if (measurements.length >= 2) {
    const s = [...measurements].sort((a, b) => a.date_measured.localeCompare(b.date_measured))
    const delta = s[s.length - 1]!.weight_kg - s[s.length - 2]!.weight_kg
    if (delta <= -0.5) {
      score -= 15
      insights.push({ sev: 'warning', title: 'Зниження ваги', desc: `Вага ${pet.name} знизилась на ${Math.abs(delta).toFixed(2)} кг з останнього зважування. Проконсультуйтесь з ветеринаром.` })
    } else if (delta >= 1) {
      score -= 5
      insights.push({ sev: 'info', title: 'Набір ваги', desc: `Набрано ${delta.toFixed(2)} кг. Зверніть увагу на раціон.` })
    } else {
      score += 5
      insights.push({ sev: 'good', title: 'Вага в нормі', desc: 'Вага стабільна — так тримати!' })
    }
  }

  // ── Symptom scan: recent week (severity) + recurring across full history ──────
  const week = records.filter(r => daysAgo(r.record_date) < 7)
  const hasCritical = week.some(r => CRITICAL_KW.some(k => lower(r.text).includes(k)))
  const hasWarn = week.some(r => WARN_KW.some(k => lower(r.text).includes(k)))
  if (hasCritical) {
    score -= 30
    insights.push({ sev: 'danger', title: 'Критичні симптоми', desc: 'Виявлено тривожні симптоми за тиждень. Необхідна ТЕРМІНОВА консультація ветеринара!' })
  } else if (hasWarn) {
    score -= 12
    insights.push({ sev: 'warning', title: 'Тривожні симптоми', desc: 'У нотатках за тиждень є ознаки погіршення стану. Уважно стежте за твариною.' })
  }

  // Recurring symptoms in the full history (chronic signal).
  const monthSymptoms = records.filter(
    r => daysAgo(r.record_date) < 30 && WARN_KW.concat(CRITICAL_KW).some(k => lower(r.text).includes(k)),
  )
  if (!hasCritical && monthSymptoms.length >= 3) {
    score -= 10
    insights.push({ sev: 'warning', title: 'Повторювані скарги', desc: `За місяць ${monthSymptoms.length} записів зі скаргами. Можливо, варто комплексне обстеження.` })
  }

  // ── Allergies from the medical card ──────────────────────────────────────────
  const allergies = lower(pet.allergies).trim()
  if (allergies && !['немає', 'ні', 'відсутні', '-'].includes(allergies)) {
    insights.push({ sev: 'info', title: 'Алергії в картці', desc: `Враховуйте при підборі ліків та харчування: ${pet.allergies!.trim().replace(/[.\s]+$/, '')}.` })
  }

  // ── Veterinary check-up recency (from history) ───────────────────────────────
  const vetRecords = records.filter(r => VET_KW.some(k => lower(r.record_type).includes(k) || lower(r.text).includes(k)))
  if (records.length > 0) {
    if (vetRecords.length === 0) {
      insights.push({ sev: 'info', title: 'Огляд у ветеринара', desc: 'В історії немає записів про візит до лікаря. Заплануйте профілактичний огляд.' })
    } else {
      const last = vetRecords.reduce((a, b) => (a.record_date > b.record_date ? a : b))
      const d = daysAgo(last.record_date)
      if (d > 365) {
        score -= 8
        insights.push({ sev: 'warning', title: 'Давній огляд', desc: `Останній візит до лікаря був ${Math.floor(d / 30)} міс. тому. Час на плановий огляд.` })
      } else {
        insights.push({ sev: 'good', title: 'Огляди регулярні', desc: `Останній візит до ветеринара ${d === 0 ? 'сьогодні' : `${d} дн. тому`}.` })
      }
    }
  }

  // ── Tasks: overdue and completion ────────────────────────────────────────────
  const overdue = tasks.filter(t => !t.is_done && new Date(t.task_time) < now)
  if (overdue.length > 0) {
    score -= Math.min(overdue.length * 5, 20)
    insights.push({ sev: 'warning', title: `Пропущено ${overdue.length} ${plural(overdue.length, ['завдання', 'завдання', 'завдань'])}`, desc: `${overdue.slice(0, 2).map(t => t.title).join(', ')}${overdue.length > 2 ? ' та ін.' : ''}.` })
  }

  const todayAll = tasks.filter(t => new Date(t.task_time).toDateString() === now.toDateString())
  if (todayAll.length > 0 && todayAll.every(t => t.is_done)) {
    score += 10
    insights.push({ sev: 'good', title: 'День виконано на 100%', desc: `Усі завдання на сьогодні (${todayAll.length}) виконано. Чудово!` })
  }

  // ── Vaccination presence ─────────────────────────────────────────────────────
  const hasVaccineTask = tasks.some(t => t.type.toLowerCase().includes('вакцин'))
  const hasVaccineRecord = records.some(r => lower(r.record_type).includes('вакцин') || lower(r.text).includes('щеплен'))
  if (!hasVaccineTask && !hasVaccineRecord) {
    insights.push({ sev: 'info', title: 'Щеплення', desc: 'Немає даних про вакцинацію. Перевірте та оновіть графік щеплень.' })
  }

  // ── Age-based recommendations (medical card) ─────────────────────────────────
  if (pet.birth_date) {
    const months = ageInMonths(pet.birth_date, now)
    if (months >= 84) insights.push({ sev: 'info', title: 'Похилий вік', desc: `У ${Math.floor(months / 12)} р. рекомендовані огляди кожні 6 міс. та контроль ваги.` })
    else if (months <= 6) insights.push({ sev: 'info', title: 'Малюк', desc: 'Не забудьте про первинну вакцинацію та обробку від паразитів.' })
  }

  score = Math.max(0, Math.min(100, score))
  if (insights.length === 0) {
    insights.push({ sev: 'good', title: 'Все чудово!', desc: `${pet.name} у відмінному стані. Продовжуйте вести моніторинг!` })
  }

  // Surface the most urgent insights first.
  const order: Record<InsightSev, number> = { danger: 0, warning: 1, info: 2, good: 3 }
  insights.sort((a, b) => order[a.sev] - order[b.sev])

  return { score, insights }
}
