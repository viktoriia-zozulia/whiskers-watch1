import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { uploadFile } from '../../api'
import { usePet } from '../../hooks/usePet'
import { run } from '../../shared/lib/toast'
import { speciesEmoji } from '../../shared/lib/format'
import { inputSm } from '../../shared/lib/styles'
import { toDateInput } from '../../shared/lib/format'
import { Modal, ModalActions } from '../../shared/ui/Modal'

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
    if (fileRef.current) fileRef.current.value = ''
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const pet = await createPet({
      name: name.trim(), species,
      breed: breed.trim() || null,
      birth_date: birth_date || null,
      weight: weight ? Number(weight) : null,
      allergies: allergies.trim() || null,
      photo_url: photoUrl,
    })
    setLoading(false)
    if (pet) onClose()
  }

  return (
    <Modal title="Додати улюбленця" onClose={onClose} size="md">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex justify-center">
          <button type="button" onClick={() => fileRef.current?.click()} aria-label="Завантажити фото"
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
            <input type="date" value={birth_date} max={toDateInput()} onChange={e => setBirthDate(e.target.value)} className={inputSm} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Вага (кг)</label>
          <input type="number" step="0.1" min="0" max="500" value={weight} onChange={e => setWeight(e.target.value)} placeholder="4.5" className={inputSm} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Алергії / особливості</label>
          <textarea rows={2} value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="Алергія на курку..." className={`${inputSm} resize-none`} />
        </div>
        <ModalActions onCancel={onClose} loading={loading} disabled={uploading || !name.trim()} />
      </form>
    </Modal>
  )
}
