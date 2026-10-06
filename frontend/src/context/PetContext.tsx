import {
  createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode,
} from 'react'
import {
  measurementsApi, petsApi, recordsApi, settingsApi, tasksApi, vetContactsApi,
  type CreateMeasurementDto, type CreatePetDto, type CreateTaskDto, type CreateVetContactDto,
  type Measurement, type MedicalRecord, type Pet, type Task, type UpdatePetDto,
  type UserSettings, type VetContact,
} from '../api'
import { run, toast } from '../shared/lib/toast'
import { careStreak, selectTodayTasks } from '../shared/lib/tasks'

type ModalKey = 'addPet' | 'addTask' | 'addVet' | 'addMeasurement' | 'passport'

interface PetContextValue {
  // data
  pets: Pet[]
  currentPet: Pet | null
  tasks: Task[]
  records: MedicalRecord[]
  vets: VetContact[]
  measurements: Measurement[]
  settings: UserSettings | null
  loading: boolean
  recordsVersion: number
  // derived
  todayTasks: Task[]
  pendingCount: number
  streak: number
  // pet actions
  switchPet: (pet: Pet) => Promise<void>
  createPet: (dto: CreatePetDto) => Promise<Pet | undefined>
  updateProfile: (form: UpdatePetDto) => Promise<void>
  updatePetPhoto: (url: string) => Promise<void>
  deletePet: () => Promise<void>
  // task actions
  createTask: (dto: CreateTaskDto) => Promise<Task | undefined>
  toggleTask: (id: number) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  // record actions
  createNote: (text: string, photoUrl: string | null, type?: string) => Promise<boolean>
  deleteRecord: (id: number) => Promise<void>
  // vet actions
  createVet: (dto: CreateVetContactDto) => Promise<VetContact | undefined>
  deleteVet: (id: number) => Promise<void>
  // measurement actions
  createMeasurement: (dto: CreateMeasurementDto) => Promise<Measurement | undefined>
  // settings
  toggleSetting: (key: 'push_enabled' | 'email_enabled') => Promise<void>
  // modal disclosure
  modal: Record<ModalKey, boolean>
  openModal: (key: ModalKey) => void
  closeModal: (key: ModalKey) => void
}

export const PetContext = createContext<PetContextValue | null>(null)

export function PetProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([])
  const [currentPet, setCurrentPet] = useState<Pet | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [vets, setVets] = useState<VetContact[]>([])
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [recordsVersion, setRecordsVersion] = useState(0)
  const [modal, setModal] = useState<Record<ModalKey, boolean>>({
    addPet: false, addTask: false, addVet: false, addMeasurement: false, passport: false,
  })

  const openModal = (key: ModalKey) => setModal(m => ({ ...m, [key]: true }))
  const closeModal = (key: ModalKey) => setModal(m => ({ ...m, [key]: false }))

  // Id of the pet whose data we want on screen. Switching pets quickly must
  // not let a slower, older response overwrite the newer pet's data.
  const activePetId = useRef<number | null>(null)

  const loadPetData = useCallback(async (pet: Pet) => {
    activePetId.current = pet.id
    const data = await run(() => Promise.all([
      tasksApi.list(pet.id), recordsApi.list(pet.id), measurementsApi.list(pet.id),
    ]))
    if (data && activePetId.current === pet.id) {
      setTasks(data[0]); setRecords(data[1]); setMeasurements(data[2])
      setRecordsVersion(v => v + 1)
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
          setCurrentPet(petList[0]!)
          await loadPetData(petList[0]!)
        }
      }
      setLoading(false)
    }
    init()
  }, [loadPetData])

  const switchPet = useCallback(async (pet: Pet) => {
    setCurrentPet(pet)
    await loadPetData(pet)
  }, [loadPetData])

  const createPet = useCallback(async (dto: CreatePetDto) => {
    const pet = await run(() => petsApi.create(dto))
    if (pet) {
      setPets(prev => [...prev, pet])
      setCurrentPet(pet)
      activePetId.current = pet.id
      setTasks([]); setRecords([]); setMeasurements([]); setRecordsVersion(v => v + 1)
      toast('Улюбленця додано', 'success')
    }
    return pet
  }, [])

  const updateProfile = useCallback(async (form: UpdatePetDto) => {
    if (!currentPet) return
    const updated = await run(() => petsApi.update(currentPet.id, form))
    if (updated) {
      setCurrentPet(updated)
      setPets(prev => prev.map(p => p.id === updated.id ? updated : p))
      toast('Зміни збережено', 'success')
    }
  }, [currentPet])

  const updatePetPhoto = useCallback(async (url: string) => {
    if (!currentPet) return
    const updated = await run(() => petsApi.update(currentPet.id, { photo_url: url }))
    if (updated) {
      setCurrentPet(updated)
      setPets(prev => prev.map(p => p.id === updated.id ? updated : p))
      toast('Фото оновлено', 'success')
    }
  }, [currentPet])

  const deletePet = useCallback(async () => {
    if (!currentPet) return
    const ok = await run(() => petsApi.delete(currentPet.id))
    if (!ok) return
    toast(`${currentPet.name} видалено`, 'success')
    const remaining = pets.filter(p => p.id !== currentPet.id)
    setPets(remaining)
    if (remaining.length > 0) {
      setCurrentPet(remaining[0]!)
      await loadPetData(remaining[0]!)
    } else {
      setCurrentPet(null); setTasks([]); setRecords([]); setMeasurements([])
    }
  }, [currentPet, pets, loadPetData])

  const createTask = useCallback(async (dto: CreateTaskDto) => {
    if (!currentPet) return undefined
    const task = await run(() => tasksApi.create(currentPet.id, dto))
    if (task) { setTasks(prev => [...prev, task]); toast('Завдання створено', 'success') }
    return task
  }, [currentPet])

  // Optimistic: flip immediately for a snappy checkbox, roll back on failure.
  const toggleTask = useCallback(async (id: number) => {
    const flip = (list: Task[]) => list.map(t => t.id === id ? { ...t, is_done: !t.is_done } : t)
    setTasks(flip)
    const updated = await run(() => tasksApi.toggle(id))
    setTasks(prev => updated ? prev.map(t => t.id === id ? updated : t) : flip(prev))
  }, [])

  const deleteTask = useCallback(async (id: number) => {
    const ok = await run(() => tasksApi.delete(id))
    if (ok) { setTasks(prev => prev.filter(t => t.id !== id)); toast('Завдання видалено', 'success') }
  }, [])

  const createNote = useCallback(async (text: string, photoUrl: string | null, type = 'Нотатка') => {
    if (!currentPet) return false
    const record = await run(() => recordsApi.create(currentPet.id, {
      record_type: type,
      text: text.trim() || undefined,
      photo_url: photoUrl || undefined,
    }))
    if (record) {
      setRecords(prev => [record, ...prev])
      setRecordsVersion(v => v + 1)
      toast('Запис додано', 'success')
      return true
    }
    return false
  }, [currentPet])

  const deleteRecord = useCallback(async (id: number) => {
    const ok = await run(() => recordsApi.delete(id))
    if (ok) {
      setRecords(prev => prev.filter(r => r.id !== id))
      setRecordsVersion(v => v + 1)
    }
  }, [])

  const createVet = useCallback(async (dto: CreateVetContactDto) => {
    const v = await run(() => vetContactsApi.create(dto))
    if (v) { setVets(prev => [v, ...prev]); toast('Контакт додано', 'success') }
    return v
  }, [])

  const deleteVet = useCallback(async (id: number) => {
    const ok = await run(() => vetContactsApi.delete(id))
    if (ok) { setVets(prev => prev.filter(v => v.id !== id)); toast('Контакт видалено', 'success') }
  }, [])

  const createMeasurement = useCallback(async (dto: CreateMeasurementDto) => {
    if (!currentPet) return undefined
    const m = await run(() => measurementsApi.create(currentPet.id, dto))
    if (m) {
      setMeasurements(prev => [m, ...prev].sort((a, b) => b.date_measured.localeCompare(a.date_measured)))
      setCurrentPet(p => p ? { ...p, weight: m.weight_kg } : p)
      setPets(prev => prev.map(p => p.id === currentPet.id ? { ...p, weight: m.weight_kg } : p))
      toast('Вимірювання збережено', 'success')
    }
    return m
  }, [currentPet])

  const toggleSetting = useCallback(async (key: 'push_enabled' | 'email_enabled') => {
    if (!settings) return
    const updated = await run(() => settingsApi.update({
      push_enabled: key === 'push_enabled' ? !settings.push_enabled : settings.push_enabled,
      email_enabled: key === 'email_enabled' ? !settings.email_enabled : settings.email_enabled,
    }))
    if (updated) setSettings(updated)
  }, [settings])

  // ── Derived values ───────────────────────────────────────────────────────────
  const todayTasks = useMemo(() => selectTodayTasks(tasks), [tasks])
  const streak = useMemo(() => careStreak(tasks), [tasks])

  const pendingCount = useMemo(() => todayTasks.filter(t => !t.is_done).length, [todayTasks])

  const value: PetContextValue = {
    pets, currentPet, tasks, records, vets, measurements, settings, loading, recordsVersion,
    todayTasks, pendingCount, streak,
    switchPet, createPet, updateProfile, updatePetPhoto, deletePet,
    createTask, toggleTask, deleteTask,
    createNote, deleteRecord,
    createVet, deleteVet,
    createMeasurement,
    toggleSetting,
    modal, openModal, closeModal,
  }

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>
}
