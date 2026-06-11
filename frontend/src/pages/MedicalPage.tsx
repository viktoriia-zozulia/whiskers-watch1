import { CareTasksList } from '../features/medical/CareTasksList'
import { HealthHistory } from '../features/medical/HealthHistory'
import { VetContactsList } from '../features/medical/VetContactsList'
import { WeightTracking } from '../features/medical/WeightTracking'

export function MedicalPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <CareTasksList />
      <WeightTracking />
      <VetContactsList />
      <HealthHistory />
    </div>
  )
}
