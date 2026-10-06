import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Printer } from 'lucide-react'
import type { Measurement, MedicalRecord, Pet, Task, VetContact } from '../../api'
import { usePet } from '../../hooks/usePet'
import { formatDate, parseDateOnly, petAge } from '../../shared/lib/format'
import { Modal } from '../../shared/ui/Modal'
import { PetAvatar } from '../../shared/ui/PetAvatar'
import { LogoMark } from '../../shared/ui/Logo'
import { WeightChart } from '../medical/WeightChart'
import { computeHealthData, insightCfg } from '../home/healthAnalysis'

const DAY = 864e5
const longDate = (d: Date) => d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
const isType = (r: MedicalRecord, ...kw: string[]) => kw.some(k => r.record_type.toLowerCase().includes(k))

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid">
      <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2 border-b border-teal-100 pb-1">{title}</h3>
      {children}
    </section>
  )
}

function Empty() {
  return <p className="text-sm text-slate-400">Немає даних</p>
}

interface PassportData {
  pet: Pet
  records: MedicalRecord[]
  tasks: Task[]
  measurements: Measurement[]
  vets: VetContact[]
}

/** The printable document itself — rendered both in the modal and for print. */
function PassportContent({ pet, records, tasks, measurements, vets }: PassportData) {
  const now = new Date()
  const { score, insights } = computeHealthData(pet, records, tasks, measurements, now)
  const preventive = records.filter(r => isType(r, 'вакцин', 'лікар', 'ліки')).slice(0, 8)
  const recentNotes = records
    .filter(r => !isType(r, 'вакцин', 'лікар', 'ліки') && now.getTime() - new Date(r.record_date).getTime() < 30 * DAY)
    .slice(0, 6)
  const upcoming = tasks
    .filter(t => !t.is_done && new Date(t.task_time) >= now && new Date(t.task_time).getTime() - now.getTime() < 30 * DAY)
    .sort((a, b) => a.task_time.localeCompare(b.task_time))
    .slice(0, 6)
  const weights = [...measurements].sort((a, b) => b.date_measured.localeCompare(a.date_measured)).slice(0, 6)
  const scoreColor = score >= 70 ? 'text-teal-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'

  return (
    <article className="bg-white text-slate-800 space-y-6">
      <header className="flex items-start justify-between gap-4 border-b-2 border-teal-500 pb-4">
        <div>
          <p className="flex items-center gap-1.5 text-teal-600 font-bold text-sm"><LogoMark size={18} /> WhiskersWatch</p>
          <h2 className="font-serif text-2xl mt-1">Паспорт здоров’я</h2>
        </div>
        <p className="text-xs text-slate-400 text-right">Сформовано<br />{longDate(now)}</p>
      </header>

      <div className="flex gap-5 items-center">
        <PetAvatar pet={pet} size={84} />
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm">
          <div><p className="text-xs text-slate-400">Кличка</p><p className="font-bold text-lg leading-tight">{pet.name}</p></div>
          <div><p className="text-xs text-slate-400">Вид / порода</p><p className="font-medium">{pet.species}{pet.breed ? `, ${pet.breed}` : ''}</p></div>
          <div><p className="text-xs text-slate-400">Дата народження</p><p className="font-medium">{pet.birth_date ? `${longDate(parseDateOnly(pet.birth_date))} (${petAge(pet.birth_date)})` : '—'}</p></div>
          <div><p className="text-xs text-slate-400">Вага</p><p className="font-medium">{pet.weight ? `${pet.weight} кг` : '—'}</p></div>
        </div>
      </div>

      {pet.allergies && (
        <div className="flex gap-2 items-start bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p><b>Алергії / особливості:</b> {pet.allergies}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        <Section title="Оцінка WhiskersAI">
          <div className="flex items-center gap-3">
            <p className={`text-4xl font-extrabold ${scoreColor}`}>{score}<span className="text-base text-slate-400">/100</span></p>
            <ul className="text-xs space-y-1 flex-1">
              {insights.slice(0, 3).map((i, n) => (
                <li key={n} className={insightCfg[i.sev].text}>{insightCfg[i.sev].emoji} {i.title}</li>
              ))}
            </ul>
          </div>
        </Section>
        <Section title="Динаміка ваги">
          {measurements.length >= 2 ? <WeightChart measurements={measurements} /> : weights.length ? (
            <p className="text-sm">{weights[0]!.weight_kg} кг · {longDate(parseDateOnly(weights[0]!.date_measured))}</p>
          ) : <Empty />}
        </Section>
      </div>

      {weights.length > 0 && (
        <Section title="Зважування">
          <table className="w-full text-sm">
            <tbody>
              {weights.map(m => (
                <tr key={m.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-1 text-slate-500 w-40">{longDate(parseDateOnly(m.date_measured))}</td>
                  <td className="py-1 font-semibold w-20">{m.weight_kg} кг</td>
                  <td className="py-1 text-slate-500">{m.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      <Section title="Щеплення, візити та лікування">
        {preventive.length ? (
          <ul className="space-y-1.5 text-sm">
            {preventive.map(r => (
              <li key={r.id} className="flex gap-3">
                <span className="text-slate-500 w-40 shrink-0">{longDate(new Date(r.record_date))}</span>
                <span><b className="font-semibold">{r.record_type}.</b> {r.text}</span>
              </li>
            ))}
          </ul>
        ) : <Empty />}
      </Section>

      <div className="grid sm:grid-cols-2 gap-6">
        <Section title="Спостереження за 30 днів">
          {recentNotes.length ? (
            <ul className="space-y-1.5 text-sm">
              {recentNotes.map(r => (
                <li key={r.id}><span className="text-slate-500">{formatDate(r.record_date)}:</span> {r.text || r.record_type}</li>
              ))}
            </ul>
          ) : <Empty />}
        </Section>
        <Section title="Заплановано">
          {upcoming.length ? (
            <ul className="space-y-1.5 text-sm">
              {upcoming.map(t => (
                <li key={t.id}><span className="text-slate-500">{formatDate(t.task_time)}:</span> {t.title} <span className="text-slate-400">({t.type})</span></li>
              ))}
            </ul>
          ) : <Empty />}
        </Section>
      </div>

      {vets.length > 0 && (
        <Section title="Контакти ветеринарів">
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            {vets.map(v => (
              <li key={v.id}><b>{v.clinic}</b>{v.doc_name ? ` — ${v.doc_name}` : ''}{v.phone ? ` · ${v.phone}` : ''}</li>
            ))}
          </ul>
        </Section>
      )}

      <footer className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">
        Документ сформовано автоматично на основі записів власника у WhiskersWatch. Не замінює висновок ветеринарного лікаря.
      </footer>
    </article>
  )
}

/** Modal preview + "Save as PDF" (browser print dialog → Save as PDF). */
export function HealthPassportModal({ onClose }: { onClose: () => void }) {
  const { currentPet, records, tasks, measurements, vets } = usePet()
  const [printRoot, setPrintRoot] = useState<HTMLElement | null>(null)

  // A body-level container that is the only visible element when printing.
  useEffect(() => {
    const el = document.createElement('div')
    el.id = 'print-root'
    document.body.appendChild(el)
    setPrintRoot(el)

    // Print in light colours even when the app is in dark mode.
    const root = document.documentElement
    let wasDark = false
    const before = () => { wasDark = root.classList.contains('dark'); root.classList.remove('dark') }
    const after = () => { if (wasDark) root.classList.add('dark') }
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => {
      window.removeEventListener('beforeprint', before)
      window.removeEventListener('afterprint', after)
      el.remove()
    }
  }, [])

  if (!currentPet) return null
  const data = { pet: currentPet, records, tasks, measurements, vets }

  return (
    <>
      <Modal title="Паспорт здоров’я" onClose={onClose} size="lg">
        <div className="rounded-2xl border border-slate-200 p-4 sm:p-6 mb-5">
          <PassportContent {...data} />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={onClose}
            className="sm:flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm">Закрити</button>
          <button type="button" onClick={() => window.print()}
            className="sm:flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-medium text-sm flex items-center justify-center gap-2">
            <Printer size={16} /> Зберегти PDF / Друк
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center">У вікні друку оберіть «Зберегти як PDF», щоб надіслати документ ветеринару.</p>
      </Modal>
      {printRoot && createPortal(<PassportContent {...data} />, printRoot)}
    </>
  )
}
