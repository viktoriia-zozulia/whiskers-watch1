import { useState } from 'react'
import { usePet } from '../../hooks/usePet'
import { inputSm } from '../../shared/lib/styles'
import { toDateTimeInput } from '../../shared/lib/format'
import { Modal, ModalActions } from '../../shared/ui/Modal'

const TYPES = ['Ліки', 'Догляд', 'Вакцина', 'Лікар', 'Інше']

// Next full hour in local time — `toISOString()` would be UTC (3h off in Kyiv).
function nextHour() {
  const d = new Date()
  d.setHours(d.getHours() + 1, 0, 0, 0)
  return toDateTimeInput(d)
}

export function AddTaskModal({ onClose }: { onClose: () => void }) {
  const { createTask, currentPet } = usePet()
  const [title, setTitle] = useState('')
  const [type, setType] = useState(TYPES[0]!)
  const [task_time, setTaskTime] = useState(nextHour)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const task = await createTask({ title: title.trim(), type, task_time: new Date(task_time).toISOString() })
    setLoading(false)
    if (task) onClose()
  }

  return (
    <Modal title={`Нове завдання${currentPet ? ` · ${currentPet.name}` : ''}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Назва *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required maxLength={120} placeholder="Дати вітаміни" className={inputSm} />
        </div>
        <div className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Тип</span>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${type === t ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Коли</label>
          <input type="datetime-local" value={task_time} onChange={e => setTaskTime(e.target.value)} required className={inputSm} />
        </div>
        <ModalActions onCancel={onClose} loading={loading} disabled={!title.trim()} />
      </form>
    </Modal>
  )
}
