// All API calls use relative URLs — the Bun frontend server proxies /api/* to the backend.

export interface User {
  id: number
  email: string
  name: string
}

export interface Pet {
  id: number
  user_id: number
  name: string
  species: string
  breed: string | null
  birth_date: string | null
  weight: number | null
  allergies: string | null
  photo_url: string | null
}

export interface Task {
  id: number
  pet_id: number
  title: string
  type: string
  task_time: string
  is_done: boolean
}

export interface MedicalRecord {
  id: number
  pet_id: number
  record_date: string
  record_type: string
  text: string
  photo_url: string | null
}

export interface VetContact {
  id: number
  user_id: number
  doc_name: string | null
  clinic: string
  phone: string | null
}

export interface Measurement {
  id: number
  pet_id: number
  date_measured: string
  weight_kg: number
  notes: string | null
}

export interface UserSettings {
  id: number
  user_id: number
  push_enabled: boolean
  email_enabled: boolean
}

// ─── Token storage ────────────────────────────────────────────────────────────

export const getToken = () => localStorage.getItem('ww_token')
export const setToken = (t: string) => localStorage.setItem('ww_token', t)
export const clearToken = () => localStorage.removeItem('ww_token')

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getToken()
  let res: Response
  try {
    res = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body != null ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error("Немає зв'язку з сервером. Перевірте підключення.")
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? 'Сталася помилка. Спробуйте ще раз.')
  }
  return res.json() as Promise<T>
}

// ─── File upload (multipart) ──────────────────────────────────────────────────

export async function uploadFile(file: File): Promise<string> {
  const token = getToken()
  const form = new FormData()
  form.append('file', file)
  let res: Response
  try {
    res = await fetch('/api/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
  } catch {
    throw new Error("Немає зв'язку з сервером. Перевірте підключення.")
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? 'Не вдалося завантажити фото.')
  }
  const data = (await res.json()) as { url: string }
  return data.url
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    req<{ token: string; user: User }>('POST', '/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    req<{ token: string; user: User }>('POST', '/api/auth/login', data),
}

// ─── Pets ─────────────────────────────────────────────────────────────────────

export const petsApi = {
  list: () => req<Pet[]>('GET', '/api/pets'),
  get: (id: number) => req<Pet>('GET', `/api/pets/${id}`),
  create: (data: Omit<Pet, 'id' | 'user_id'>) => req<Pet>('POST', '/api/pets', data),
  update: (id: number, data: Partial<Omit<Pet, 'id' | 'user_id'>>) =>
    req<Pet>('PUT', `/api/pets/${id}`, data),
  delete: (id: number) => req<{ ok: boolean }>('DELETE', `/api/pets/${id}`),
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasksApi = {
  list: (petId: number) => req<Task[]>('GET', `/api/pets/${petId}/tasks`),  // :id on server
  create: (petId: number, data: { title: string; type: string; task_time: string }) =>
    req<Task>('POST', `/api/pets/${petId}/tasks`, data),
  toggle: (id: number) => req<Task>('PATCH', `/api/tasks/${id}/toggle`),
  delete: (id: number) => req<{ ok: boolean }>('DELETE', `/api/tasks/${id}`),
}

// ─── Medical Records ──────────────────────────────────────────────────────────

export const recordsApi = {
  list: (petId: number) => req<MedicalRecord[]>('GET', `/api/pets/${petId}/records`),
  create: (petId: number, data: { record_type: string; text?: string; photo_url?: string }) =>
    req<MedicalRecord>('POST', `/api/pets/${petId}/records`, data),
  delete: (id: number) => req<{ ok: boolean }>('DELETE', `/api/records/${id}`),
}

// ─── Measurements ─────────────────────────────────────────────────────────────

export const measurementsApi = {
  list: (petId: number) => req<Measurement[]>('GET', `/api/pets/${petId}/measurements`),
  create: (petId: number, data: { date_measured: string; weight_kg: number; notes?: string }) =>
    req<Measurement>('POST', `/api/pets/${petId}/measurements`, data),
}

// ─── Vet Contacts ─────────────────────────────────────────────────────────────

export const vetContactsApi = {
  list: () => req<VetContact[]>('GET', '/api/vet-contacts'),
  create: (data: { clinic: string; doc_name?: string; phone?: string }) =>
    req<VetContact>('POST', '/api/vet-contacts', data),
  update: (id: number, data: Partial<Omit<VetContact, 'id' | 'user_id'>>) =>
    req<VetContact>('PUT', `/api/vet-contacts/${id}`, data),
  delete: (id: number) => req<{ ok: boolean }>('DELETE', `/api/vet-contacts/${id}`),
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settingsApi = {
  get: () => req<UserSettings>('GET', '/api/settings'),
  update: (data: { push_enabled: boolean; email_enabled: boolean }) =>
    req<UserSettings>('PUT', '/api/settings', data),
}
