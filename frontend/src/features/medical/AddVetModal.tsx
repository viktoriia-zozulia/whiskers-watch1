import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { usePet } from '../../hooks/usePet'
import { inputSm } from '../../shared/lib/styles'

export function AddVetModal({ onClose }: { onClose: () => void }) {
  const { createVet } = usePet()
  const [clinic, setClinic] = useState('')
  const [doc_name, setDocName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const v = await createVet({ clinic, doc_name: doc_name || undefined, phone: phone || undefined })
    setLoading(false)
    if (v) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold">Контакт ветеринара</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Клініка *</label>
            <input value={clinic} onChange={e => setClinic(e.target.value)} required placeholder="Ветклініка «Лапа»" className={inputSm} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Лікар</label>
            <input value={doc_name} onChange={e => setDocName(e.target.value)} placeholder="Др. Іван Петренко" className={inputSm} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Телефон</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+380 50 123 45 67" className={inputSm} />
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
