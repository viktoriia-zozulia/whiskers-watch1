import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { usePet } from '../../hooks/usePet'
import { inputSm } from '../../shared/lib/styles'

export function AddMeasurementModal({ onClose }: { onClose: () => void }) {
  const { createMeasurement } = usePet()
  const [date_measured, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [weight_kg, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const m = await createMeasurement({ date_measured, weight_kg: Number(weight_kg), notes: notes || undefined })
    setLoading(false)
    if (m) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold">Зважування</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Дата</label>
              <input type="date" value={date_measured} onChange={e => setDate(e.target.value)} className={inputSm} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Вага (кг) *</label>
              <input type="number" step="0.01" value={weight_kg} onChange={e => setWeight(e.target.value)} required placeholder="5.2" className={inputSm} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Примітки</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Після обіду" className={inputSm} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm">Скасувати</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white font-medium text-sm flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />} Зберегти
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
