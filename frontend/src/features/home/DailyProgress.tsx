import { TrendingUp } from 'lucide-react'
import { usePet } from '../../hooks/usePet'

export function DailyProgress() {
  const { todayTasks } = usePet()
  if (todayTasks.length === 0) return null
  const done = todayTasks.filter(t => t.is_done).length
  const pct = Math.round((done / todayTasks.length) * 100)
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-1.5 text-sm">
        <span className="font-medium text-slate-500 flex items-center gap-1.5">
          <TrendingUp size={14} className="text-teal-500" /> Прогрес дня
        </span>
        <span className="font-bold text-teal-600">{done}/{todayTasks.length} ({pct}%)</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
