import { useEffect, useRef, useState } from 'react'
import { Camera, Loader2, Save } from 'lucide-react'
import { uploadFile, type Pet, type UpdatePetDto } from '../../http_client'
import { usePet } from '../../hooks/usePet'
import { run } from '../../shared/lib/toast'
import { PetAvatar } from '../../shared/ui/PetAvatar'
import { inputCls } from '../../shared/lib/styles'

export function ProfileForm() {
  const { currentPet, updateProfile, updatePetPhoto } = usePet()
  const [form, setForm] = useState<UpdatePetDto>(currentPet ?? {})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const avatarRef = useRef<HTMLInputElement>(null)

  // Re-sync the form whenever the active pet changes.
  useEffect(() => { setForm(currentPet ?? {}) }, [currentPet?.id])

  async function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await run(() => uploadFile(file))
    if (url) await updatePetPhoto(url)
    setUploading(false)
    if (avatarRef.current) avatarRef.current.value = ''
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await updateProfile(form)
    setSaving(false)
  }

  // PetAvatar wants a full Pet; merge the current pet with edited form fields.
  const previewPet = currentPet ? { ...currentPet, ...form } as Pet : null

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-6">Редагування профілю</h2>

      <div className="flex justify-center mb-8">
        <button type="button" onClick={() => avatarRef.current?.click()}
          className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-teal-200 group">
          <PetAvatar pet={previewPet} size={112} />
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center text-white opacity-0 group-hover:opacity-100">
            {uploading ? <Loader2 size={22} className="animate-spin opacity-100" /> : <Camera size={22} />}
          </span>
          {uploading && <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-white"><Loader2 size={22} className="animate-spin" /></span>}
        </button>
        <input ref={avatarRef} type="file" accept="image/*" hidden onChange={pickAvatar} />
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-700">Кличка</label>
            <input type="text" value={form.name ?? ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-700">Вид</label>
            <select value={form.species ?? ''} onChange={e => setForm(p => ({ ...p, species: e.target.value }))} className={inputCls}>
              <option>Кіт</option><option>Собака</option><option>Птах</option>
              <option>Кролик</option><option>Інше</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-700">Порода</label>
            <input type="text" value={form.breed ?? ''} onChange={e => setForm(p => ({ ...p, breed: e.target.value }))} placeholder="Не вказано" className={inputCls} />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-700">Дата народження</label>
            <input type="date" value={form.birth_date ?? ''} onChange={e => setForm(p => ({ ...p, birth_date: e.target.value }))} className={inputCls} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Вага (кг)</label>
          <input type="number" step="0.1" value={form.weight ?? ''} onChange={e => setForm(p => ({ ...p, weight: e.target.value ? Number(e.target.value) : null }))} placeholder="Не вказано" className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Алергії / Особливості</label>
          <textarea rows={3} value={form.allergies ?? ''} onChange={e => setForm(p => ({ ...p, allergies: e.target.value }))} placeholder="Алергії, хронічні стани, особливості харчування..." className={`${inputCls} resize-none`} />
        </div>
        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={saving}
            className="bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Зберегти зміни
          </button>
        </div>
      </form>
    </div>
  )
}
