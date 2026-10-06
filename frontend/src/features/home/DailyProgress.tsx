import { useEffect, useRef } from 'react'
import { Flame, TrendingUp } from 'lucide-react'
import { usePet } from '../../hooks/usePet'
import { fireConfetti } from '../../shared/lib/confetti'
import { plural } from '../../shared/lib/format'
import { toast } from '../../shared/lib/toast'

export function DailyProgress() {
  const { todayTasks, streak, currentPet } = usePet()
  const done = todayTasks.filter(t => t.is_done).length
  const total = todayTasks.length
  const pct = total ? Math.round((done / total) * 100) : 0

  // Celebrate only the moment the user ticks off the last task — i.e. the set
  // of tasks is unchanged and only completion moved to 100%. Loading data,
  // switching pets or deleting a task never fires it.
  const ids = todayTasks.map(t => t.id).join(',')
  const prev = useRef({ ids, pct })
  useEffect(() => {
    const p = prev.current
    if (p.ids === ids && p.pct < 100 && pct === 100 && total > 0) {
      fireConfetti()
      toast(`День виконано! ${currentPet?.name ?? 'Улюбленець'} під надійним доглядом 💚`, 'success')
    }
    prev.current = { ids, pct }
  }, [ids, pct, total, currentPet?.name])

  if (total === 0 && streak === 0) return null

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-1.5 text-sm gap-3">
        <span className="font-medium text-slate-500 flex items-center gap-1.5">
          <TrendingUp size={14} className="text-teal-500" /> Прогрес дня
        </span>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <span title="Днів поспіль, коли всі завдання виконано"
              className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
              <Flame size={12} className="text-orange-500" /> {streak} {plural(streak, ['день', 'дні', 'днів'])} поспіль
            </span>
          )}
          {total > 0 && <span className="font-bold text-teal-600">{done}/{total} ({pct}%)</span>}
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
