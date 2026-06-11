import { Trash2 } from 'lucide-react'
import { usePet } from '../../hooks/usePet'

export function DangerZone() {
  const { currentPet, deletePet } = usePet()

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-2 text-red-600">Небезпечна зона</h2>
      <p className="text-sm text-slate-600 mb-4">Ці дії неможливо скасувати.</p>
      <button onClick={deletePet} className="text-red-600 bg-red-50 hover:bg-red-100 px-6 py-3 rounded-xl font-medium transition-colors text-sm flex items-center gap-2">
        <Trash2 size={16} /> Видалити профіль {currentPet?.name}
      </button>
    </div>
  )
}
