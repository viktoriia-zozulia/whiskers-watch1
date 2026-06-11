export interface MedicalRecord {
  id: number
  pet_id: number
  record_date: string
  record_type: string
  text: string
  photo_url: string | null
}

export interface CreateRecordDto {
  record_type: string
  text?: string
  photo_url?: string
}

// Server-side filtering options for the health history.
export interface RecordFilters {
  type?: string
  search?: string
}
