export interface UserSettings {
  id: number
  user_id: number
  push_enabled: boolean
  email_enabled: boolean
}

export interface UpdateSettingsDto {
  push_enabled: boolean
  email_enabled: boolean
}
