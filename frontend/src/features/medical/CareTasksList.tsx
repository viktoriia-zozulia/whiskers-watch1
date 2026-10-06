import { useState } from 'react'
import { CheckCircle2, ChevronDown, Circle, Plus, ShieldAlert, Trash2 } from 'lucide-react'
import type { Task } from '../../api'
import { usePet } from '../../hooks/usePet'
import { formatDate } from '../../shared/lib/format'
import { getTypeIcon } from '../../shared/lib/icons'
import { isOverdue } from '../../shared/lib/tasks'

const DONE_PREVIEW = 4

function TaskCard({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  const overdue = isOverdue(task)
  const tone = task.is_done ? 'bg-teal-50 border-teal-100' : overdue ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
  return (
    <div className={`group p-4 rounded-2xl border transition-colors ${tone}`}>
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 min-w-0">
          <button onClick={onToggle} aria-label={task.is_done ? 'Позначити невиконаним' : 'Позначити виконаним'}
            className="text-teal-500 shrink-0 transition-transform active:scale-90">
            {task.is_done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          </button>
          <span className={`truncate ${task.is_done ? 'line-through text-slate-500' : ''}`}>{task.title}</span>
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          {getTypeIcon(task.type)}
          <button onClick={onDelete} aria-label="Видалити завдання"
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className={`text-sm font-medium ${task.is_done ? 'text-teal-700' : overdue ? 'text-red-700' : 'text-orange-700'}`}>
        {task.is_done ? `✓ Виконано · ${formatDate(task.task_time)}` : `${overdue ? 'Прострочено' : 'Заплановано'}: ${formatDate(task.task_time)}`}
      </p>
    </div>
  )
}

export function CareTasksList() {
  const { tasks, toggleTask, deleteTask, openModal } = usePet()
  const [showAllDone, setShowAllDone] = useState(false)

  // Pending: nearest first (overdue on top). Done: most recent first.
  const pending = tasks.filter(t => !t.is_done).sort((a, b) => a.task_time.localeCompare(b.task_time))
  const done = tasks.filter(t => t.is_done).sort((a, b) => b.task_time.localeCompare(a.task_time))
  const visibleDone = showAllDone ? done : done.slice(0, DONE_PREVIEW)

  const card = (t: Task) => (
    <TaskCard key={t.id} task={t} onToggle={() => toggleTask(t.id)} onDelete={() => deleteTask(t.id)} />
  )

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShieldAlert className="text-teal-600" /> Завдання та процедури
        </h2>
        <button onClick={() => openModal('addTask')} className="text-teal-600 text-sm font-medium hover:underline flex items-center gap-1">
          <Plus size={16} /> Додати
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">
          Немає запланованих завдань. <button onClick={() => openModal('addTask')} className="text-teal-600 hover:underline">Додати завдання</button>
        </p>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Заплановано · {pending.length}</p>
            {pending.length === 0
              ? <p className="text-sm text-slate-400">Усе виконано 🎉</p>
              : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{pending.map(card)}</div>}
          </div>

          {done.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Виконано · {done.length}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{visibleDone.map(card)}</div>
              {done.length > DONE_PREVIEW && (
                <button onClick={() => setShowAllDone(v => !v)}
                  className="mt-3 text-sm text-teal-600 font-medium hover:underline flex items-center gap-1">
                  <ChevronDown size={16} className={`transition-transform ${showAllDone ? 'rotate-180' : ''}`} />
                  {showAllDone ? 'Згорнути' : `Показати всі (${done.length})`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
