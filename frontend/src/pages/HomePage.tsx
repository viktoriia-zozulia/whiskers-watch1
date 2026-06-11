import { HealthInsights } from '../features/home/HealthInsights'
import { QuickNote } from '../features/home/QuickNote'
import { RecentEvents } from '../features/home/RecentEvents'
import { TodayTasks } from '../features/home/TodayTasks'

export function HomePage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
      <div className="lg:col-span-7 space-y-8">
        <TodayTasks />
        <QuickNote />
      </div>
      <div className="lg:col-span-5 space-y-6">
        <HealthInsights />
        <RecentEvents />
      </div>
    </div>
  )
}
