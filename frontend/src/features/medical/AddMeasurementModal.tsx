import { useState } from 'react'
import { usePet } from '../../hooks/usePet'
import { inputSm } from '../../shared/lib/styles'
import { toDateInput } from '../../shared/lib/format'
import { Modal, ModalActions } from '../../shared/ui/Modal'

export function AddMeasurementModal({ onClose }: { onClose: () => void }) {
  const { createMeasurement, currentPet } = usePet()
  const [date_measured, setDate] = useState(() => toDateInput())
  const [weight_kg, setWeight] = useState(currentPet?.weight ? String(currentPet.weight) : '')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const m = await createMeasurement({ date_measured, weight_kg: Number(weight_kg), notes: notes.trim() || undefined })
    setLoading(false)
    if (m) onClose()
  }

  return (
    <Modal title="Зважування" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Вага (кг) *</label>
            <input type="number" step="0.01" min="0.01" max="500" value={weight_kg} onChange={e => setWeight(e.target.value)} required placeholder="5.2" className={inputSm} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Дата</label>
            <input type="date" value={date_measured} max={toDateInput()} onChange={e => setDate(e.target.value)} required className={inputSm} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Примітки</label>
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Після обіду" className={inputSm} />
        </div>
        <ModalActions onCancel={onClose} loading={loading} />
      </form>
    </Modal>
  )
}
