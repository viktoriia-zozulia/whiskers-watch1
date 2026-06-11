// Shared HTTP client. All API calls use relative URLs — the Bun frontend
// server proxies /api/* to the backend.

// ─── Token storage ────────────────────────────────────────────────────────────

export const getToken = () => localStorage.getItem('ww_token')
export const setToken = (t: string) => localStorage.setItem('ww_token', t)
export const clearToken = () => localStorage.removeItem('ww_token')

// ─── Fetch helper ─────────────────────────────────────────────────────────────

export async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
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

// Build a query string from a filters object, skipping empty values.
export function qs(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') search.set(k, String(v))
  }
  const s = search.toString()
  return s ? `?${s}` : ''
}
