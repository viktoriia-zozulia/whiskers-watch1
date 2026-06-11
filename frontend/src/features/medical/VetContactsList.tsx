import { Phone, Plus, Stethoscope, Trash2 } from 'lucide-react'
import { usePet } from '../../hooks/usePet'

export function VetContactsList() {
  const { vets, deleteVet, openModal } = usePet()

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Stethoscope className="text-purple-600" /> Ветеринари</h2>
        <button onClick={() => openModal('addVet')} className="text-teal-600 text-sm font-medium hover:underline flex items-center gap-1">
          <Plus size={16} /> Додати
        </button>
      </div>
      {vets.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">Немає збережених контактів клінік.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {vets.map(v => (
            <div key={v.id} className="group p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
              <h3 className="font-bold text-slate-800">{v.clinic}</h3>
              {v.doc_name && <p className="text-sm text-slate-600 mt-0.5">{v.doc_name}</p>}
              {v.phone && (
                <a href={`tel:${v.phone}`} className="text-sm text-teal-600 mt-1 flex items-center gap-1 hover:underline">
                  <Phone size={13} /> {v.phone}
                </a>
              )}
              <button onClick={() => deleteVet(v.id)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors md:opacity-0 md:group-hover:opacity-100">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
