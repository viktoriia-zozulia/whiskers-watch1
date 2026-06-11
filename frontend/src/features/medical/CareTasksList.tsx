import { CheckCircle2, Circle, Plus, ShieldAlert, Trash2 } from 'lucide-react'
import { usePet } from '../../hooks/usePet'
import { formatDate } from '../../shared/lib/format'
import { getTypeIcon } from '../../shared/lib/icons'

export function CareTasksList() {
  const { tasks, toggleTask, deleteTask, openModal } = usePet()

  // Show every scheduled task here (the medical card is the full schedule),
  // most recent first. Care procedures are highlighted, but all types appear.
  const sorted = [...tasks].sort((a, b) => b.task_time.localeCompare(a.task_time))

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
      {sorted.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">
          Немає запланованих завдань. <button onClick={() => openModal('addTask')} className="text-teal-600 hover:underline">Додати завдання</button>
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map(task => (
            <div key={task.id} className={`group p-4 rounded-2xl border transition-colors ${task.is_done ? 'bg-teal-50 border-teal-100' : 'bg-orange-50 border-orange-100'}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <button onClick={() => toggleTask(task.id)} className="text-teal-500 shrink-0">
                    {task.is_done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </button>
                  <span className={task.is_done ? 'line-through text-slate-500' : ''}>{task.title}</span>
                </h3>
                <div className="flex items-center gap-1 shrink-0">
                  {getTypeIcon(task.type)}
                  <button onClick={() => deleteTask(task.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors md:opacity-0 md:group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className={`text-sm font-medium ${task.is_done ? 'text-teal-700' : 'text-orange-700'}`}>
                {task.is_done ? '✓ Виконано' : `Заплановано: ${formatDate(task.task_time)}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
