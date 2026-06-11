import { qs, req } from '../client'
import type { CreateRecordDto, MedicalRecord, RecordFilters } from './record.models'

export const recordsApi = {
  list: (petId: number, filters: RecordFilters = {}) =>
    req<MedicalRecord[]>('GET', `/api/pets/${petId}/records${qs({ ...filters })}`),
  create: (petId: number, data: CreateRecordDto) =>
    req<MedicalRecord>('POST', `/api/pets/${petId}/records`, data),
  delete: (id: number) => req<{ ok: boolean }>('DELETE', `/api/records/${id}`),
}
