import { req } from '../client'
import type { CreateMeasurementDto, Measurement } from './measurement.models'

export const measurementsApi = {
  list: (petId: number) => req<Measurement[]>('GET', `/api/pets/${petId}/measurements`),
  create: (petId: number, data: CreateMeasurementDto) =>
    req<Measurement>('POST', `/api/pets/${petId}/measurements`, data),
}
