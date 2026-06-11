import { req } from '../client'
import type { CreateVetContactDto, UpdateVetContactDto, VetContact } from './vetContact.models'

export const vetContactsApi = {
  list: () => req<VetContact[]>('GET', '/api/vet-contacts'),
  create: (data: CreateVetContactDto) => req<VetContact>('POST', '/api/vet-contacts', data),
  update: (id: number, data: UpdateVetContactDto) => req<VetContact>('PUT', `/api/vet-contacts/${id}`, data),
  delete: (id: number) => req<{ ok: boolean }>('DELETE', `/api/vet-contacts/${id}`),
}
