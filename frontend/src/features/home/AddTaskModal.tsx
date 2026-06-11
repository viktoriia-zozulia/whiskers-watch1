import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { usePet } from '../../hooks/usePet'
import { inputSm } from '../../shared/lib/styles'

export function AddTaskModal({ onClose }: { onClose: () => void }) {
  const { createTask } = usePet()
  const [title, setTitle] = useState('')
  const [type, setType] = useState('Ліки')
  const [task_time, setTaskTime] = useState(() => {
    const d = new Date(); d.setMinutes(0, 0, 0)
    return d.toISOString().slice(0, 16)
  })
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const task = await createTask({ title, type, task_time: new Date(task_time).toISOString() })
    setLoading(false)
    if (task) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold">Нове завдання</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Назва *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Дати вітаміни" className={inputSm} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Тип</label>
              <select value={type} onChange={e => setType(e.target.value)} className={inputSm}>
                <option>Ліки</option><option>Догляд</option><option>Вакцина</option>
                <option>Лікар</option><option>Інше</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Час</label>
              <input type="datetime-local" value={task_time} onChange={e => setTaskTime(e.target.value)} className={inputSm} />
            </div>
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
