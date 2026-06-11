import { useEffect, useState } from 'react'
import { recordsApi, type MedicalRecord } from '../http_client'
import { run } from '../shared/lib/toast'

// Fetches a pet's medical history from the backend, applying server-side
// filtering by record type and free-text search. Re-fetches whenever the
// filters change, the pet changes, or the shared records version bumps
// (e.g. after a note is added or deleted elsewhere).
export function useFilteredRecords(petId: number | undefined, recordsVersion: number) {
  const [type, setType] = useState('')
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(false)

  // Debounce the free-text search so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (petId == null) { setRecords([]); return }
    let active = true
    setLoading(true)
    run(() => recordsApi.list(petId, { type: type || undefined, search: debounced || undefined }))
      .then(data => { if (active && data) setRecords(data) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [petId, type, debounced, recordsVersion])

  return { records, loading, type, setType, search, setSearch }
}
