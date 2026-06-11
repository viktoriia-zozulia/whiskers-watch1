import type { Generated } from 'kysely'

export interface UsersTable {
  id: Generated<number>
  email: string
  password_hash: string | null
  name: string
  google_id: string | null
}

export interface UserSettingsTable {
  id: Generated<number>
  user_id: number
  push_enabled: Generated<boolean>
  email_enabled: Generated<boolean>
}

export interface VetContactsTable {
  id: Generated<number>
  user_id: number
  doc_name: string | null
  clinic: string
  phone: string | null
}

export interface PetsTable {
  id: Generated<number>
  user_id: number
  name: string
  species: string
  breed: string | null
  birth_date: string | null
  weight: number | null
  allergies: string | null
  photo_url: string | null
}

export interface TasksTable {
  id: Generated<number>
  pet_id: number
  title: string
  type: string
  task_time: Date
  is_done: Generated<boolean>
}

export interface MedicalRecordsTable {
  id: Generated<number>
  pet_id: number
  record_date: Date
  record_type: string
  text: string
  photo_url: string | null
}

export interface MeasurementsTable {
  id: Generated<number>
  pet_id: number
  date_measured: string
  weight_kg: number
  notes: string | null
}

export interface Database {
  users: UsersTable
  user_settings: UserSettingsTable
  vet_contacts: VetContactsTable
  pets: PetsTable
  tasks: TasksTable
  medical_records: MedicalRecordsTable
  measurements: MeasurementsTable
}
