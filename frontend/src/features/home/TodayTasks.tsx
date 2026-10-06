import { CheckCircle2, Circle, Clock, Plus, Trash2 } from 'lucide-react'
import { usePet } from '../../hooks/usePet'
import { formatDate } from '../../shared/lib/format'
import { getTypeIcon } from '../../shared/lib/icons'
import { isOverdue } from '../../shared/lib/tasks'
import { DailyProgress } from './DailyProgress'

export function TodayTasks() {
  const { todayTasks, pendingCount, toggleTask, deleteTask, openModal } = usePet()

  return (
    <section>
      <DailyProgress />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
          План на сьогодні
          {pendingCount > 0 && <span className="bg-teal-100 text-teal-700 text-xs py-0.5 px-2 rounded-full">{pendingCount}</span>}
        </h2>
        <button onClick={() => openModal('addTask')} className="flex text-teal-600 text-sm font-medium hover:underline items-center gap-1">
          <Plus size={16} /> Додати
        </button>
      </div>

      {todayTasks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400">
          <CheckCircle2 size={32} className="mx-auto mb-2 text-slate-200" />
          <p>Завдань на сьогодні немає</p>
          <button onClick={() => openModal('addTask')} className="mt-3 text-teal-600 text-sm font-medium hover:underline">+ Додати завдання</button>
        </div>
      ) : (
        <div className="space-y-3">
          {todayTasks.map(task => (
            <div key={task.id}
              className={`group flex items-center p-4 rounded-2xl border transition-all ${task.is_done
                ? 'bg-slate-50 border-slate-100 opacity-60'
                : 'bg-white border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-md'}`}>
              <button onClick={() => toggleTask(task.id)} aria-label={task.is_done ? 'Позначити невиконаним' : 'Позначити виконаним'}
                className="mr-4 text-teal-500 shrink-0 transition-transform active:scale-90">
                {task.is_done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleTask(task.id)}>
                <p className={`font-medium md:text-lg truncate ${task.is_done ? 'line-through text-slate-500' : 'text-slate-700'}`}>{task.title}</p>
                <p className={`text-xs md:text-sm flex items-center gap-1 mt-1 ${isOverdue(task) ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                  <Clock size={14} /> {isOverdue(task) && 'Прострочено · '}{formatDate(task.task_time)}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center shrink-0 ml-2">{getTypeIcon(task.type)}</div>
              <button onClick={() => deleteTask(task.id)} aria-label="Видалити завдання"
                className="ml-1 w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 md:opacity-0 md:group-hover:opacity-100">
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
