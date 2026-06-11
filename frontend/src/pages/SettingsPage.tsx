import { AccountSection } from '../features/settings/AccountSection'
import { DangerZone } from '../features/settings/DangerZone'
import { NotificationSettings } from '../features/settings/NotificationSettings'

export function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <NotificationSettings />
      <AccountSection />
      <DangerZone />
    </div>
  )
}
