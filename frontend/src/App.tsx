import { useState, useEffect, useCallback, useRef } from 'react'
import {
  CheckCircle2, Circle, Plus, Activity, Pill, Stethoscope, Clock,
  ChevronDown, Home, FileText, Settings, User, Send, LogOut,
  Bell, Syringe, ShieldAlert, Save, X, Loader2, ChevronRight,
  Camera, Trash2, ImagePlus, Phone, Scale, AlertCircle, CheckCircle, Info,
} from 'lucide-react'
import {
  authApi, petsApi, tasksApi, recordsApi, settingsApi, measurementsApi, vetContactsApi,
  uploadFile, getToken, setToken, clearToken,
  type Pet, type Task, type MedicalRecord, type UserSettings, type VetContact,
  type Measurement, type User as UserType,
} from './_shared/api'
import { toast, useToasts, dismissToast } from './_shared/toast'
import './index.css'

// ─── Toast Host ─────────────────────────────────────────────────────────────────

function ToastHost() {
  const toasts = useToasts()
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[calc(100vw-2rem)] w-80">
      {toasts.map(t => {
        const cfg = t.type === 'success'
          ? { Icon: CheckCircle, cls: 'border-teal-200 bg-teal-50 text-teal-800', iconCls: 'text-teal-500' }
          : t.type === 'info'
          ? { Icon: Info, cls: 'border-blue-200 bg-blue-50 text-blue-800', iconCls: 'text-blue-500' }
          : { Icon: AlertCircle, cls: 'border-red-200 bg-red-50 text-red-800', iconCls: 'text-red-500' }
        return (
          <div key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-md animate-[slideIn_0.2s_ease-out] ${cfg.cls}`}>
            <cfg.Icon size={18} className={`shrink-0 mt-0.5 ${cfg.iconCls}`} />
            <p className="text-sm flex-1 leading-snug">{t.msg}</p>
            <button onClick={() => dismissToast(t.id)} className="shrink-0 opacity-50 hover:opacity-100">
              <X size={15} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

// run an async action and surface any error as a toast
async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn()
  } catch (e) {
    toast(e instanceof Error ? e.message : 'Сталася помилка. Спробуйте ще раз.')
    return undefined
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff >= 0 && diff < 60_000) return 'Щойно'
  if (diff >= 0 && diff < 3_600_000) return `${Math.floor(diff / 60_000)} хв тому`
  if (d.toDateString() === now.toDateString()) {
    return `Сьогодні, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) {
    return `Вчора, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })
}

function petAge(birth_date: string | null): string {
  if (!birth_date) return '—'
  const birth = new Date(birth_date)
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
  if (months < 12) return `${months} міс.`
  const years = Math.floor(months / 12)
  return `${years} ${years === 1 ? 'рік' : years < 5 ? 'роки' : 'років'}`
}

function speciesEmoji(species?: string) {
  if (species === 'Кіт') return '🐱'
  if (species === 'Собака') return '🐶'
  if (species === 'Птах') return '🐦'
  if (species === 'Кролик') return '🐰'
  return '🐾'
}

function getTypeIcon(type: string, size = 18) {
  const t = type.toLowerCase()
  if (t.includes('pill') || t.includes('medication') || t.includes('ліки'))
    return <Pill size={size} className="text-teal-600" />
  if (t.includes('vet') || t.includes('clinic') || t.includes('лікар'))
    return <Stethoscope size={size} className="text-blue-600" />
  if (t.includes('vaccine') || t.includes('вакцин') || t.includes('щеплення'))
    return <Syringe size={size} className="text-purple-600" />
  return <Activity size={size} className="text-orange-600" />
}

function getRecordDot(type: string) {
  const t = type.toLowerCase()
  if (t.includes('vet') || t.includes('clinic') || t.includes('лікар')) return 'bg-blue-500'
  if (t.includes('pill') || t.includes('medication') || t.includes('ліки')) return 'bg-teal-500'
  if (t.includes('vaccine') || t.includes('вакцин')) return 'bg-purple-500'
  if (t.includes('symptom') || t.includes('симптом') || t.includes('нотатк')) return 'bg-slate-400'
  return 'bg-orange-400'
}

const inputCls =
  'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder:text-slate-300'
const inputSm =
  'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm placeholder:text-slate-300'

// ─── Auth Page ────────────────────────────────────────────────────────────────

function AuthPage({ onAuth }: { onAuth: (token: string, user: UserType) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const res = mode === 'login'
        ? await authApi.login({ email, password })
        : await authApi.register({ email, password, name })
      setToken(res.token)
      onAuth(res.token, res.user)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Помилка сервера')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8 text-teal-600">
          <Activity size={36} />
          <span className="text-3xl font-bold text-slate-800">WhiskersWatch</span>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100">
          <div className="flex mb-6 bg-slate-100 rounded-2xl p-1">
            <button onClick={() => { setMode('login'); setErr('') }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${mode === 'login' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}>
              Вхід
            </button>
            <button onClick={() => { setMode('register'); setErr('') }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${mode === 'register' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}>
              Реєстрація
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Ваше ім'я</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  placeholder="Вікторія" className={inputCls} />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com" className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Пароль</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="мінімум 6 символів" className={inputCls} />
            </div>

            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" /> {err}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 mt-2">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {mode === 'login' ? 'Увійти' : 'Створити акаунт'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Add Pet Modal ────────────────────────────────────────────────────────────

function AddPetModal({ onSave, onClose }: { onSave: (pet: Pet) => void; onClose: () => void }) {
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
    const pet = await run(() => petsApi.create({
      name, species,
      breed: breed || null,
      birth_date: birth_date || null,
      weight: weight ? Number(weight) : null,
      allergies: allergies || null,
      photo_url: photoUrl,
    }))
    setLoading(false)
    if (pet) { toast('Улюбленця додано', 'success'); onSave(pet) }
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

// ─── Add Task Modal ───────────────────────────────────────────────────────────

function AddTaskModal({ petId, onSave, onClose }: { petId: number; onSave: (t: Task) => void; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('Ліки')
  const [task_time, setTaskTime] = useState(() => {
    const d = new Date(); d.setMinutes(0, 0, 0)
    return d.toISOString().slice(0, 16)
  })
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const task = await run(() => tasksApi.create(petId, { title, type, task_time: new Date(task_time).toISOString() }))
    setLoading(false)
    if (task) { toast('Завдання створено', 'success'); onSave(task) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold">Нове завдання</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Назва *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Дати вітаміни" className={inputSm} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Тип</label>
              <select value={type} onChange={e => setType(e.target.value)} className={inputSm}>
                <option>Ліки</option><option>Догляд</option><option>Вакцина</option>
                <option>Лікар</option><option>Інше</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Час</label>
              <input type="datetime-local" value={task_time} onChange={e => setTaskTime(e.target.value)} className={inputSm} />
            </div>
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

// ─── Add Vet Modal ────────────────────────────────────────────────────────────

function AddVetModal({ onSave, onClose }: { onSave: (v: VetContact) => void; onClose: () => void }) {
  const [clinic, setClinic] = useState('')
  const [doc_name, setDocName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const v = await run(() => vetContactsApi.create({ clinic, doc_name: doc_name || undefined, phone: phone || undefined }))
    setLoading(false)
    if (v) { toast('Контакт додано', 'success'); onSave(v) }
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

// ─── Add Measurement Modal ────────────────────────────────────────────────────

function AddMeasurementModal({ petId, onSave, onClose }: { petId: number; onSave: (m: Measurement) => void; onClose: () => void }) {
  const [date_measured, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [weight_kg, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const m = await run(() => measurementsApi.create(petId, {
      date_measured, weight_kg: Number(weight_kg), notes: notes || undefined,
    }))
    setLoading(false)
    if (m) { toast('Вимірювання збережено', 'success'); onSave(m) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold">Зважування</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Дата</label>
              <input type="date" value={date_measured} onChange={e => setDate(e.target.value)} className={inputSm} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Вага (кг) *</label>
              <input type="number" step="0.01" value={weight_kg} onChange={e => setWeight(e.target.value)} required placeholder="5.2" className={inputSm} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Примітки</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Після обіду" className={inputSm} />
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

// ─── Pet Avatar (with photo) ──────────────────────────────────────────────────

function PetAvatar({ pet, size = 56 }: { pet: Pet | null; size?: number }) {
  if (pet?.photo_url) {
    return <img src={pet.photo_url} alt={pet.name}
      className="rounded-full object-cover border-2 border-teal-200" style={{ width: size, height: size }} />
  }
  return (
    <div className="rounded-full bg-teal-100 flex items-center justify-center border-2 border-teal-200"
      style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {speciesEmoji(pet?.species)}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

type Page = 'home' | 'medical' | 'profile' | 'settings'

function MainApp({ user, onLogout }: { user: UserType; onLogout: () => void }) {
  const [activePage, setActivePage] = useState<Page>('home')
  const [pets, setPets] = useState<Pet[]>([])
  const [currentPet, setCurrentPet] = useState<Pet | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [vets, setVets] = useState<VetContact[]>([])
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [quickNote, setQuickNote] = useState('')
  const [notePhoto, setNotePhoto] = useState<string | null>(null)
  const [noteUploading, setNoteUploading] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [showAddPet, setShowAddPet] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddVet, setShowAddVet] = useState(false)
  const [showAddMeasurement, setShowAddMeasurement] = useState(false)
  const [showPetSwitcher, setShowPetSwitcher] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [profileForm, setProfileForm] = useState<Partial<Pet>>({})

  const noteFileRef = useRef<HTMLInputElement>(null)
  const avatarFileRef = useRef<HTMLInputElement>(null)

  const loadPetData = useCallback(async (pet: Pet) => {
    const data = await run(() => Promise.all([
      tasksApi.list(pet.id), recordsApi.list(pet.id), measurementsApi.list(pet.id),
    ]))
    if (data) {
      setTasks(data[0]); setRecords(data[1]); setMeasurements(data[2])
    }
  }, [])

  useEffect(() => {
    async function init() {
      const data = await run(() => Promise.all([
        petsApi.list(),
        settingsApi.get().catch(() => null),
        vetContactsApi.list().catch(() => [] as VetContact[]),
      ]))
      if (data) {
        const [petList, s, v] = data
        setPets(petList); setSettings(s); setVets(v)
        if (petList.length > 0) {
          const p = petList[0]!
          setCurrentPet(p); setProfileForm(p)
          await loadPetData(p)
        }
      }
      setLoading(false)
    }
    init()
  }, [loadPetData])

  async function switchPet(pet: Pet) {
    setCurrentPet(pet); setProfileForm(pet); setShowPetSwitcher(false)
    await loadPetData(pet)
  }

  async function toggleTask(id: number) {
    const updated = await run(() => tasksApi.toggle(id))
    if (updated) setTasks(prev => prev.map(t => t.id === id ? updated : t))
  }

  async function deleteTask(id: number) {
    const ok = await run(() => tasksApi.delete(id))
    if (ok) { setTasks(prev => prev.filter(t => t.id !== id)); toast('Завдання видалено', 'success') }
  }

  async function pickNotePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setNoteUploading(true)
    const url = await run(() => uploadFile(file))
    if (url) setNotePhoto(url)
    setNoteUploading(false)
    if (noteFileRef.current) noteFileRef.current.value = ''
  }

  async function submitNote(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPet) return
    if (!quickNote.trim() && !notePhoto) return
    setSavingNote(true)
    const record = await run(() => recordsApi.create(currentPet.id, {
      record_type: 'Нотатка',
      text: quickNote.trim() || undefined,
      photo_url: notePhoto || undefined,
    }))
    setSavingNote(false)
    if (record) {
      setRecords(prev => [record, ...prev])
      setQuickNote(''); setNotePhoto(null)
      toast('Запис додано', 'success')
    }
  }

  async function deleteRecord(id: number) {
    const ok = await run(() => recordsApi.delete(id))
    if (ok) setRecords(prev => prev.filter(r => r.id !== id))
  }

  async function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !currentPet) return
    setAvatarUploading(true)
    const url = await run(() => uploadFile(file))
    if (url) {
      const updated = await run(() => petsApi.update(currentPet.id, { photo_url: url }))
      if (updated) {
        setCurrentPet(updated); setProfileForm(updated)
        setPets(prev => prev.map(p => p.id === updated.id ? updated : p))
        toast('Фото оновлено', 'success')
      }
    }
    setAvatarUploading(false)
    if (avatarFileRef.current) avatarFileRef.current.value = ''
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPet) return
    setSavingProfile(true)
    const updated = await run(() => petsApi.update(currentPet.id, profileForm))
    setSavingProfile(false)
    if (updated) {
      setCurrentPet(updated)
      setPets(prev => prev.map(p => p.id === updated.id ? updated : p))
      toast('Зміни збережено', 'success')
    }
  }

  async function toggleSetting(key: 'push_enabled' | 'email_enabled') {
    if (!settings) return
    const updated = await run(() => settingsApi.update({
      push_enabled: key === 'push_enabled' ? !settings.push_enabled : settings.push_enabled,
      email_enabled: key === 'email_enabled' ? !settings.email_enabled : settings.email_enabled,
    }))
    if (updated) setSettings(updated)
  }

  async function deleteVet(id: number) {
    const ok = await run(() => vetContactsApi.delete(id))
    if (ok) { setVets(prev => prev.filter(v => v.id !== id)); toast('Контакт видалено', 'success') }
  }

  async function deletePet() {
    if (!currentPet || !confirm(`Видалити ${currentPet.name}? Всі дані буде втрачено.`)) return
    const ok = await run(() => petsApi.delete(currentPet.id))
    if (!ok) return
    toast(`${currentPet.name} видалено`, 'success')
    const remaining = pets.filter(p => p.id !== currentPet.id)
    setPets(remaining)
    if (remaining.length > 0) {
      const p = remaining[0]!
      setCurrentPet(p); setProfileForm(p)
      await loadPetData(p)
      setActivePage('home')
    } else {
      setCurrentPet(null); setTasks([]); setRecords([]); setMeasurements([])
    }
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-teal-500" />
          <p>Завантаження...</p>
        </div>
      </div>
    )
  }

  // ── No pets ──────────────────────────────────────────────────────────────────
  if (pets.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity size={36} className="text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Вітаємо, {user.name || 'друже'}!</h2>
          <p className="text-slate-500 mb-6">Додайте свого першого улюбленця, щоб почати моніторинг здоров'я.</p>
          <button onClick={() => setShowAddPet(true)}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 mx-auto">
            <Plus size={20} /> Додати улюбленця
          </button>
          <button onClick={onLogout} className="mt-4 text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1 mx-auto">
            <LogOut size={14} /> Вийти
          </button>
        </div>
        {showAddPet && (
          <AddPetModal
            onSave={p => { setPets([p]); setCurrentPet(p); setProfileForm(p); setShowAddPet(false) }}
            onClose={() => setShowAddPet(false)} />
        )}
      </div>
    )
  }

  // ── Derived ──────────────────────────────────────────────────────────────────
  const todayTasks = tasks.filter(t => {
    const d = new Date(t.task_time)
    const now = new Date()
    return d.toDateString() === now.toDateString() || d <= now
  })
  const pendingCount = todayTasks.filter(t => !t.is_done).length
  const careTasks = tasks.filter(t => {
    const type = t.type.toLowerCase()
    return type.includes('вакцин') || type.includes('vaccine') || type.includes('обробка') || type.includes('лікар')
  })

  // ── Home ─────────────────────────────────────────────────────────────────────
  const renderHome = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
      <div className="lg:col-span-7 space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              План на сьогодні
              {pendingCount > 0 && <span className="bg-teal-100 text-teal-700 text-xs py-0.5 px-2 rounded-full">{pendingCount}</span>}
            </h2>
            <button onClick={() => setShowAddTask(true)} className="flex text-teal-600 text-sm font-medium hover:underline items-center gap-1">
              <Plus size={16} /> Додати
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-slate-200" />
              <p>Завдань на сьогодні немає</p>
              <button onClick={() => setShowAddTask(true)} className="mt-3 text-teal-600 text-sm font-medium hover:underline">+ Додати завдання</button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map(task => (
                <div key={task.id}
                  className={`group flex items-center p-4 rounded-2xl border transition-all ${task.is_done
                    ? 'bg-slate-50 border-slate-100 opacity-60'
                    : 'bg-white border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-md'}`}>
                  <button onClick={() => toggleTask(task.id)} className="mr-4 text-teal-500 shrink-0">
                    {task.is_done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleTask(task.id)}>
                    <p className={`font-medium md:text-lg truncate ${task.is_done ? 'line-through text-slate-500' : 'text-slate-700'}`}>{task.title}</p>
                    <p className="text-xs md:text-sm text-slate-400 flex items-center gap-1 mt-1">
                      <Clock size={14} /> {formatDate(task.task_time)}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center shrink-0 ml-2">{getTypeIcon(task.type)}</div>
                  <button onClick={() => deleteTask(task.id)}
                    className="ml-1 w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 md:opacity-0 md:group-hover:opacity-100">
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

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
          <form onSubmit={submitNote}
            className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-1 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-50 transition-all">
            <button type="button" onClick={() => noteFileRef.current?.click()}
              className="w-10 h-10 shrink-0 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 flex items-center justify-center transition-colors">
              {noteUploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={20} />}
            </button>
            <input ref={noteFileRef} type="file" accept="image/*" hidden onChange={pickNotePhoto} />
            <input type="text" value={quickNote} onChange={e => setQuickNote(e.target.value)}
              placeholder={`Як почувається ${currentPet?.name ?? 'улюбленець'}?`}
              className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-sm md:text-base text-slate-700 placeholder:text-slate-300" />
            <button type="submit" disabled={savingNote || noteUploading || (!quickNote.trim() && !notePhoto)}
              className="bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white p-3 rounded-xl transition-colors flex items-center gap-2 font-medium shrink-0">
              <span className="hidden sm:inline text-sm">Зберегти</span>
              {savingNote ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </section>
      </div>

      <div className="lg:col-span-5">
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg md:text-xl font-bold">Останні події</h2>
            <button onClick={() => setActivePage('medical')} className="text-teal-600 text-sm font-medium hover:underline flex items-center gap-1">
              Вся історія <ChevronRight size={14} />
            </button>
          </div>
          {records.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Записів ще немає</p>
          ) : (
            <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
              {records.slice(0, 4).map(item => (
                <div key={item.id} className="relative pl-6">
                  <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${getRecordDot(item.record_type)}`} />
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-slate-400 mb-1">{formatDate(item.record_date)}</p>
                  <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                    <p className="text-xs font-medium text-slate-400 mb-1">{item.record_type}</p>
                    {item.text && <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>}
                    {item.photo_url && <img src={item.photo_url} alt="" className="mt-2 rounded-lg max-h-40 object-cover w-full" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )

  // ── Medical ──────────────────────────────────────────────────────────────────
  const renderMedical = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Vaccinations / care */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <ShieldAlert className="text-teal-600" /> Вакцинація та обробки
        </h2>
        {careTasks.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">
            Немає запланованих процедур. <button onClick={() => setShowAddTask(true)} className="text-teal-600 hover:underline">Додати завдання</button>
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {careTasks.map(task => (
              <div key={task.id} className={`p-4 rounded-2xl border ${task.is_done ? 'bg-teal-50 border-teal-100' : 'bg-orange-50 border-orange-100'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800">{task.title}</h3>
                  {getTypeIcon(task.type)}
                </div>
                <p className={`text-sm font-medium ${task.is_done ? 'text-teal-700' : 'text-orange-700'}`}>
                  {task.is_done ? '✓ Виконано' : `Заплановано: ${formatDate(task.task_time)}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weight tracking */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><Scale className="text-blue-600" /> Контроль ваги</h2>
          <button onClick={() => setShowAddMeasurement(true)} className="text-teal-600 text-sm font-medium hover:underline flex items-center gap-1">
            <Plus size={16} /> Зважити
          </button>
        </div>
        {measurements.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">Ще немає вимірювань ваги.</p>
        ) : (
          <div className="space-y-2">
            {measurements.map((m, i) => {
              const prev = measurements[i + 1]
              const delta = prev ? m.weight_kg - prev.weight_kg : 0
              return (
                <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-700">{m.weight_kg} кг
                      {delta !== 0 && (
                        <span className={`ml-2 text-xs font-medium ${delta > 0 ? 'text-orange-500' : 'text-teal-600'}`}>
                          {delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(2)} кг
                        </span>
                      )}
                    </p>
                    {m.notes && <p className="text-xs text-slate-400 mt-0.5">{m.notes}</p>}
                  </div>
                  <span className="text-sm text-slate-400">{new Date(m.date_measured).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Vet contacts */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><Stethoscope className="text-purple-600" /> Ветеринари</h2>
          <button onClick={() => setShowAddVet(true)} className="text-teal-600 text-sm font-medium hover:underline flex items-center gap-1">
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

      {/* Full history */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Повна історія здоров'я</h2>
          <span className="text-sm text-slate-400">{records.length} записів</span>
        </div>
        {records.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FileText size={32} className="mx-auto mb-2 text-slate-200" />
            <p>Записів ще немає. Використовуйте «Швидкий запис» на головній.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
            {records.map(item => (
              <div key={item.id} className="relative pl-6 group">
                <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center">
                  <div className={`w-2 h-2 rounded-full ${getRecordDot(item.record_type)}`} />
                </div>
                <p className="text-sm font-semibold text-slate-400 mb-1">{formatDate(item.record_date)}</p>
                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 relative">
                  <p className="text-xs font-semibold text-slate-400 mb-1">{item.record_type}</p>
                  {item.text && <p className="text-base text-slate-700 leading-relaxed">{item.text}</p>}
                  {item.photo_url && <img src={item.photo_url} alt="" className="mt-2 rounded-xl max-h-72 object-cover" />}
                  <button onClick={() => deleteRecord(item.id)}
                    className="absolute top-3 right-3 md:opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // ── Profile ──────────────────────────────────────────────────────────────────
  const renderProfile = () => (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-6">Редагування профілю</h2>

      <div className="flex justify-center mb-8">
        <button type="button" onClick={() => avatarFileRef.current?.click()}
          className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-teal-200 group">
          <PetAvatar pet={currentPet} size={112} />
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center text-white opacity-0 group-hover:opacity-100">
            {avatarUploading ? <Loader2 size={22} className="animate-spin opacity-100" /> : <Camera size={22} />}
          </span>
          {avatarUploading && <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-white"><Loader2 size={22} className="animate-spin" /></span>}
        </button>
        <input ref={avatarFileRef} type="file" accept="image/*" hidden onChange={pickAvatar} />
      </div>

      <form onSubmit={saveProfile} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-700">Кличка</label>
            <input type="text" value={profileForm.name ?? ''} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} className={inputCls} />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-700">Вид</label>
            <select value={profileForm.species ?? ''} onChange={e => setProfileForm(p => ({ ...p, species: e.target.value }))} className={inputCls}>
              <option>Кіт</option><option>Собака</option><option>Птах</option>
              <option>Кролик</option><option>Інше</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-700">Порода</label>
            <input type="text" value={profileForm.breed ?? ''} onChange={e => setProfileForm(p => ({ ...p, breed: e.target.value }))} placeholder="Не вказано" className={inputCls} />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-700">Дата народження</label>
            <input type="date" value={profileForm.birth_date ?? ''} onChange={e => setProfileForm(p => ({ ...p, birth_date: e.target.value }))} className={inputCls} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Вага (кг)</label>
          <input type="number" step="0.1" value={profileForm.weight ?? ''} onChange={e => setProfileForm(p => ({ ...p, weight: e.target.value ? Number(e.target.value) : null }))} placeholder="Не вказано" className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Алергії / Особливості</label>
          <textarea rows={3} value={profileForm.allergies ?? ''} onChange={e => setProfileForm(p => ({ ...p, allergies: e.target.value }))} placeholder="Алергії, хронічні стани, особливості харчування..." className={`${inputCls} resize-none`} />
        </div>
        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={savingProfile}
            className="bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2">
            {savingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Зберегти зміни
          </button>
        </div>
      </form>
    </div>
  )

  // ── Settings ─────────────────────────────────────────────────────────────────
  const renderSettings = () => (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Bell size={20} className="text-teal-600" /> Сповіщення</h2>
        <div className="space-y-4">
          {[
            { key: 'push_enabled' as const, label: 'Push-сповіщення', desc: 'Отримувати нагадування на пристрій' },
            { key: 'email_enabled' as const, label: 'Email-розсилка', desc: "Щотижневий звіт про здоров'я" },
          ].map(({ key, label, desc }) => {
            const on = settings?.[key] ?? false
            return (
              <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">{label}</p>
                  <p className="text-sm text-slate-500">{desc}</p>
                </div>
                <button onClick={() => toggleSetting(key)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${on ? 'bg-teal-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-2">Акаунт</h2>
        <p className="text-sm text-slate-500 mb-4">{user.name ? `${user.name} · ` : ''}{user.email || 'Ваш акаунт'}</p>
        <button onClick={onLogout}
          className="flex items-center gap-2 text-slate-600 bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded-xl font-medium transition-colors">
          <LogOut size={18} /> Вийти з акаунту
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-2 text-red-600">Небезпечна зона</h2>
        <p className="text-sm text-slate-600 mb-4">Ці дії неможливо скасувати.</p>
        <button onClick={deletePet} className="text-red-600 bg-red-50 hover:bg-red-100 px-6 py-3 rounded-xl font-medium transition-colors text-sm flex items-center gap-2">
          <Trash2 size={16} /> Видалити профіль {currentPet?.name}
        </button>
      </div>
    </div>
  )

  // ── Layout ───────────────────────────────────────────────────────────────────
  const navItems = [['home', Home, 'Головна'], ['medical', FileText, 'Медична карта'], ['profile', User, 'Профіль'], ['settings', Settings, 'Налаштування']] as const
  const mobileNav = [['home', Home, 'Головна'], ['medical', FileText, 'Картка'], ['profile', User, 'Профіль'], ['settings', Settings, 'Опції']] as const

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-2 text-teal-600 font-bold text-xl border-b border-slate-100">
          <Activity size={28} /> WhiskersWatch
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(([page, Icon, label]) => (
            <button key={page} onClick={() => setActivePage(page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activePage === page ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              <Icon size={20} /> {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={onLogout} className="w-full flex items-center gap-3 text-slate-400 hover:text-slate-600 px-4 py-2 font-medium transition-colors">
            <LogOut size={20} /> Вийти
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
        <header className="bg-white px-6 md:px-10 pt-8 pb-5 shadow-sm z-10 lg:flex lg:justify-between lg:items-center">
          <div className="flex justify-between items-center mb-4 lg:mb-0">
            <div className="flex items-center gap-4 cursor-pointer relative" onClick={() => setShowPetSwitcher(v => !v)}>
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

              {showPetSwitcher && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 min-w-[200px] z-20">
                  {pets.map(p => (
                    <button key={p.id} onClick={e => { e.stopPropagation(); switchPet(p) }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm font-medium flex items-center gap-2 ${p.id === currentPet?.id ? 'text-teal-600' : 'text-slate-700'}`}>
                      <span className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-teal-50 shrink-0">
                        {p.photo_url ? <img src={p.photo_url} alt="" className="w-full h-full object-cover" /> : speciesEmoji(p.species)}
                      </span>
                      {p.name}
                      {p.id === currentPet?.id && <span className="ml-auto text-teal-500">✓</span>}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button onClick={e => { e.stopPropagation(); setShowPetSwitcher(false); setShowAddPet(true) }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-teal-600 font-medium flex items-center gap-2">
                      <Plus size={14} /> Додати нового
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 lg:hidden">
              <button onClick={() => setShowAddTask(true)} className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
                <Plus size={20} />
              </button>
            </div>
          </div>

          {activePage !== 'settings' && currentPet && (
            <div className="flex justify-between gap-3 lg:gap-6 lg:w-1/2 max-w-xl">
              <div className="flex-1 bg-teal-50 p-3 md:p-4 rounded-2xl text-center shadow-sm">
                <p className="text-xs md:text-sm text-teal-600 font-medium mb-1">Вік</p>
                <p className="font-bold text-slate-700 md:text-lg">{petAge(currentPet.birth_date)}</p>
              </div>
              <div className="flex-1 bg-blue-50 p-3 md:p-4 rounded-2xl text-center shadow-sm">
                <p className="text-xs md:text-sm text-blue-600 font-medium mb-1">Вага</p>
                <p className="font-bold text-slate-700 md:text-lg">{currentPet.weight ? `${currentPet.weight} кг` : '—'}</p>
              </div>
              <div className="flex-1 bg-orange-50 p-3 md:p-4 rounded-2xl text-center shadow-sm">
                <p className="text-xs md:text-sm text-orange-600 font-medium mb-1">Завдань</p>
                <p className="font-bold text-slate-700 md:text-lg">{pendingCount > 0 ? `${pendingCount} ⏰` : '0 ✓'}</p>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 px-6 md:px-10 pt-6 md:pt-10 overflow-y-auto" onClick={() => showPetSwitcher && setShowPetSwitcher(false)}>
          {activePage === 'home' && renderHome()}
          {activePage === 'medical' && renderMedical()}
          {activePage === 'profile' && renderProfile()}
          {activePage === 'settings' && renderSettings()}
        </main>

        <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-20 rounded-t-3xl shadow-lg">
          {mobileNav.map(([page, Icon, label]) => (
            <button key={page} onClick={() => setActivePage(page)}
              className={`flex flex-col items-center gap-1 transition-colors ${activePage === page ? 'text-teal-600' : 'text-slate-400'}`}>
              <Icon size={22} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Modals */}
      {showAddPet && (
        <AddPetModal
          onSave={p => { setPets(prev => [...prev, p]); setCurrentPet(p); setProfileForm(p); setTasks([]); setRecords([]); setMeasurements([]); setShowAddPet(false) }}
          onClose={() => setShowAddPet(false)} />
      )}
      {showAddTask && currentPet && (
        <AddTaskModal petId={currentPet.id}
          onSave={t => { setTasks(prev => [...prev, t]); setShowAddTask(false) }}
          onClose={() => setShowAddTask(false)} />
      )}
      {showAddVet && (
        <AddVetModal
          onSave={v => { setVets(prev => [v, ...prev]); setShowAddVet(false) }}
          onClose={() => setShowAddVet(false)} />
      )}
      {showAddMeasurement && currentPet && (
        <AddMeasurementModal petId={currentPet.id}
          onSave={m => {
            setMeasurements(prev => [m, ...prev].sort((a, b) => b.date_measured.localeCompare(a.date_measured)))
            setCurrentPet(p => p ? { ...p, weight: m.weight_kg } : p)
            setPets(prev => prev.map(p => p.id === currentPet.id ? { ...p, weight: m.weight_kg } : p))
            setShowAddMeasurement(false)
          }}
          onClose={() => setShowAddMeasurement(false)} />
      )}
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function App() {
  const [user, setUser] = useState<UserType | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) { setChecking(false); return }
    petsApi.list()
      .then(() => {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/')))
          setUser({ id: payload.userId, email: '', name: '' })
        } catch { clearToken() }
      })
      .catch(() => clearToken())
      .finally(() => setChecking(false))
  }, [])

  function handleLogout() {
    clearToken()
    setUser(null)
  }

  return (
    <>
      <ToastHost />
      {checking ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 size={32} className="animate-spin text-teal-500" />
        </div>
      ) : !user ? (
        <AuthPage onAuth={(_t, u) => setUser(u)} />
      ) : (
        <MainApp user={user} onLogout={handleLogout} />
      )}
    </>
  )
}

export default App
