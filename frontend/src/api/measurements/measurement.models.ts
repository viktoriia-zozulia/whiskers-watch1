export interface Measurement {
  id: number
  pet_id: number
  date_measured: string
  weight_kg: number
  notes: string | null
}

export interface CreateMeasurementDto {
  date_measured: string
  weight_kg: number
  notes?: string
}
