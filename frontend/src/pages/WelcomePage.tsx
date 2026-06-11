import { Activity, LogOut, Plus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { usePet } from '../hooks/usePet'

// Shown when the logged-in user has no pets yet.
export function WelcomePage() {
  const { user, logout } = useAuth()
  const { openModal } = usePet()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity size={36} className="text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-slate-800">Вітаємо, {user?.name || 'друже'}!</h2>
        <p className="text-slate-500 mb-6">Додайте свого першого улюбленця, щоб почати моніторинг здоров'я.</p>
        <button onClick={() => openModal('addPet')}
          className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 mx-auto">
          <Plus size={20} /> Додати улюбленця
        </button>
        <button onClick={logout} className="mt-4 text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1 mx-auto">
          <LogOut size={14} /> Вийти
        </button>
      </div>
    </div>
  )
}
