import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { usePet } from '../../hooks/usePet'
import { inputSm } from '../../shared/lib/styles'
import { Modal } from '../../shared/ui/Modal'

export function DangerZone() {
  const { currentPet, deletePet } = usePet()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [deleting, setDeleting] = useState(false)

  if (!currentPet) return null
  const matches = typed.trim().toLowerCase() === currentPet.name.trim().toLowerCase()

  async function confirmDelete(e: React.FormEvent) {
    e.preventDefault()
    if (!matches) return
    setDeleting(true)
    await deletePet()
    setDeleting(false)
    setOpen(false)
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-red-100">
      <h2 className="text-xl font-bold mb-2 text-red-600">Небезпечна зона</h2>
      <p className="text-sm text-slate-600 mb-4">Ці дії неможливо скасувати.</p>
      <button onClick={() => { setTyped(''); setOpen(true) }}
        className="text-red-600 bg-red-50 hover:bg-red-100 px-6 py-3 rounded-xl font-medium transition-colors text-sm flex items-center gap-2">
        <Trash2 size={16} /> Видалити профіль {currentPet.name}
      </button>

      {open && (
        <Modal title={`Видалити ${currentPet.name}?`} onClose={() => setOpen(false)}>
          <form onSubmit={confirmDelete} className="space-y-4">
            <p className="text-sm text-slate-600">
              Буде видалено профіль, усі завдання, медичні записи та історію ваги.
              Щоб підтвердити, введіть кличку <b className="text-slate-800">{currentPet.name}</b>.
            </p>
            <input value={typed} onChange={e => setTyped(e.target.value)} placeholder={currentPet.name} className={inputSm} />
            <div className="flex gap-3">
              <button type="button" onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm">Скасувати</button>
              <button type="submit" disabled={!matches || deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white font-medium text-sm">
                {deleting ? 'Видаляю…' : 'Видалити назавжди'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
