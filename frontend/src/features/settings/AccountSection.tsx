import { LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export function AccountSection() {
  const { user, logout } = useAuth()

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-2">Акаунт</h2>
      <p className="text-sm text-slate-500 mb-4">{user?.name ? `${user.name} · ` : ''}{user?.email || 'Ваш акаунт'}</p>
      <button onClick={logout}
        className="flex items-center gap-2 text-slate-600 bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded-xl font-medium transition-colors">
        <LogOut size={18} /> Вийти з акаунту
      </button>
    </div>
  )
}
