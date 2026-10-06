import { req } from '../client'
import type { CreatePetDto, Pet, UpdatePetDto } from './pet.models'

export const petsApi = {
  list: () => req<Pet[]>('GET', '/api/pets'),
  get: (id: number) => req<Pet>('GET', `/api/pets/${id}`),
  create: (data: CreatePetDto) => req<Pet>('POST', '/api/pets', data),
  update: (id: number, data: UpdatePetDto) => req<Pet>('PUT', `/api/pets/${id}`, data),
  delete: (id: number) => req<{ ok: boolean }>('DELETE', `/api/pets/${id}`),
}
