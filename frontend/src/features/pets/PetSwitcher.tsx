import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { usePet } from '../../hooks/usePet'
import { PetAvatar } from '../../shared/ui/PetAvatar'
import { speciesEmoji } from '../../shared/lib/format'

export function PetSwitcher() {
  const { pets, currentPet, switchPet, openModal } = usePet()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-4 cursor-pointer relative" onClick={() => setOpen(v => !v)}>
      <div className="relative">
        <PetAvatar pet={currentPet} size={56} />
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-teal-500 border-2 border-white rounded-full" />
      </div>
      <div>
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-1">
          {currentPet?.name} <ChevronDown size={18} className="text-slate-400" />
        </h1>
        <p className="text-sm text-slate-500">{currentPet?.breed ?? currentPet?.species}</p>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={e => { e.stopPropagation(); setOpen(false) }} />
          <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 min-w-[200px] z-20">
            {pets.map(p => (
              <button key={p.id} onClick={e => { e.stopPropagation(); setOpen(false); switchPet(p) }}
                className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm font-medium flex items-center gap-2 ${p.id === currentPet?.id ? 'text-teal-600' : 'text-slate-700'}`}>
                <span className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-teal-50 shrink-0">
                  {p.photo_url ? <img src={p.photo_url} alt="" className="w-full h-full object-cover" /> : speciesEmoji(p.species)}
                </span>
                {p.name}
                {p.id === currentPet?.id && <span className="ml-auto text-teal-500">✓</span>}
              </button>
            ))}
            <div className="border-t border-slate-100 mt-1 pt-1">
              <button onClick={e => { e.stopPropagation(); setOpen(false); openModal('addPet') }}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-teal-600 font-medium flex items-center gap-2">
                <Plus size={14} /> Додати нового
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
