import { useRef, useState } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import { uploadFile } from '../../http_client'
import { usePet } from '../../hooks/usePet'
import { run } from '../../shared/lib/toast'
import { speciesEmoji } from '../../shared/lib/format'
import { inputSm } from '../../shared/lib/styles'

export function AddPetModal({ onClose }: { onClose: () => void }) {
  const { createPet } = usePet()
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('Кіт')
  const [breed, setBreed] = useState('')
  const [birth_date, setBirthDate] = useState('')
  const [weight, setWeight] = useState('')
  const [allergies, setAllergies] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await run(() => uploadFile(file))
    if (url) setPhotoUrl(url)
    setUploading(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const pet = await createPet({
      name, species,
      breed: breed || null,
      birth_date: birth_date || null,
      weight: weight ? Number(weight) : null,
      allergies: allergies || null,
      photo_url: photoUrl,
    })
    setLoading(false)
    if (pet) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Додати улюбленця</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex justify-center">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="relative w-24 h-24 rounded-full bg-teal-50 border-2 border-dashed border-teal-200 flex items-center justify-center overflow-hidden hover:border-teal-400 transition-colors">
              {photoUrl
                ? <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                : <span className="text-3xl">{speciesEmoji(species)}</span>}
              <span className="absolute bottom-0 inset-x-0 bg-black/40 text-white py-1 flex items-center justify-center">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Кличка *</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="Сніжок" className={inputSm} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Вид *</label>
              <select value={species} onChange={e => setSpecies(e.target.value)} className={inputSm}>
                <option>Кіт</option><option>Собака</option><option>Птах</option>
                <option>Кролик</option><option>Інше</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Порода</label>
              <input value={breed} onChange={e => setBreed(e.target.value)} placeholder="Шотландська" className={inputSm} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Дата нар.</label>
              <input type="date" value={birth_date} onChange={e => setBirthDate(e.target.value)} className={inputSm} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Вага (кг)</label>
            <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="4.5" className={inputSm} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Алергії / особливості</label>
            <textarea rows={2} value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="Алергія на курку..." className={`${inputSm} resize-none`} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm">Скасувати</button>
            <button type="submit" disabled={loading || uploading}
              className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white font-medium text-sm flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />} Зберегти
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
