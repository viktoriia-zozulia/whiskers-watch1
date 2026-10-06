import { useEffect, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { usePet } from '../../hooks/usePet'
import { PetAvatar } from '../../shared/ui/PetAvatar'

export function PetSwitcher() {
  const { pets, currentPet, switchPet, openModal } = usePet()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(v => !v)} aria-haspopup="menu" aria-expanded={open}
        className="flex items-center gap-4 text-left rounded-2xl -m-1 p-1 hover:bg-slate-50 transition-colors">
        <div className="relative">
          <PetAvatar pet={currentPet} size={56} />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-teal-500 border-2 border-white rounded-full" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-1">
            {currentPet?.name} <ChevronDown size={18} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </h1>
          <p className="text-sm text-slate-500">{currentPet?.breed || currentPet?.species}</p>
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 min-w-[220px] z-20 animate-in fade-in slide-in-from-top-2 duration-150">
            {pets.map(p => (
              <button key={p.id} role="menuitem" onClick={() => { setOpen(false); if (p.id !== currentPet?.id) switchPet(p) }}
                className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm font-medium flex items-center gap-2 ${p.id === currentPet?.id ? 'text-teal-600' : 'text-slate-700'}`}>
                <PetAvatar pet={p} size={28} />
                <span className="truncate">{p.name}</span>
                {p.id === currentPet?.id && <span className="ml-auto text-teal-500">✓</span>}
              </button>
            ))}
            <div className="border-t border-slate-100 mt-1 pt-1">
              <button role="menuitem" onClick={() => { setOpen(false); openModal('addPet') }}
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
