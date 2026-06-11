// Public surface of the HTTP layer — re-exports every service and model so
// the rest of the app imports from a single, stable path.

export { getToken, setToken, clearToken, uploadFile } from './client'

export { authApi } from './auth/auth.service'
export type { User, AuthResponse, LoginDto, RegisterDto, AuthConfig } from './auth/auth.models'

export { petsApi } from './pets/pet.service'
export type { Pet, CreatePetDto, UpdatePetDto } from './pets/pet.models'

export { tasksApi } from './tasks/task.service'
export type { Task, CreateTaskDto } from './tasks/task.models'

export { recordsApi } from './records/record.service'
export type { MedicalRecord, CreateRecordDto, RecordFilters } from './records/record.models'

export { measurementsApi } from './measurements/measurement.service'
export type { Measurement, CreateMeasurementDto } from './measurements/measurement.models'

export { vetContactsApi } from './vetContacts/vetContact.service'
export type { VetContact, CreateVetContactDto, UpdateVetContactDto } from './vetContacts/vetContact.models'

export { settingsApi } from './settings/settings.service'
export type { UserSettings, UpdateSettingsDto } from './settings/settings.models'

export { notificationsApi } from './notifications/notification.service'
export type { NotificationStatus, DigestResult } from './notifications/notification.models'
