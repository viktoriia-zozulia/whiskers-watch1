import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Send, X } from 'lucide-react'
import { uploadFile } from '../../http_client'
import { usePet } from '../../hooks/usePet'
import { run } from '../../shared/lib/toast'

export function QuickNote() {
  const { currentPet, createNote } = usePet()
  const [quickNote, setQuickNote] = useState('')
  const [notePhoto, setNotePhoto] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await run(() => uploadFile(file))
    if (url) setNotePhoto(url)
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!quickNote.trim() && !notePhoto) return
    setSaving(true)
    const ok = await createNote(quickNote, notePhoto)
    setSaving(false)
    if (ok) { setQuickNote(''); setNotePhoto(null) }
  }

  return (
    <section>
      <h2 className="text-lg md:text-xl font-bold mb-4">Швидкий запис стану</h2>
      {notePhoto && (
        <div className="mb-3 relative inline-block">
          <img src={notePhoto} alt="" className="h-24 rounded-xl border border-slate-200 object-cover" />
          <button onClick={() => setNotePhoto(null)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 shadow hover:text-red-500">
            <X size={13} />
          </button>
        </div>
      )}
      <form onSubmit={submit}
        className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-1 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-50 transition-all">
        <button type="button" onClick={() => fileRef.current?.click()}
          className="w-10 h-10 shrink-0 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 flex items-center justify-center transition-colors">
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={20} />}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
        <input type="text" value={quickNote} onChange={e => setQuickNote(e.target.value)}
          placeholder={`Як почувається ${currentPet?.name ?? 'улюбленець'}?`}
          className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-sm md:text-base text-slate-700 placeholder:text-slate-300" />
        <button type="submit" disabled={saving || uploading || (!quickNote.trim() && !notePhoto)}
          className="bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white p-3 rounded-xl transition-colors flex items-center gap-2 font-medium shrink-0">
          <span className="hidden sm:inline text-sm">Зберегти</span>
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </section>
  )
}
