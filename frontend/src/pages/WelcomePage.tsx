import { LogOut, Plus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { usePet } from '../hooks/usePet'
import { LogoMark } from '../shared/ui/Logo'

// Shown when the logged-in user has no pets yet.
export function WelcomePage() {
  const { user, logout } = useAuth()
  const { openModal } = usePet()

  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center p-5">
      <div className="text-center max-w-md">
        <LogoMark size={56} className="text-teal-600 mx-auto mb-6" />
        <h1 className="font-serif text-3xl sm:text-4xl tracking-tight mb-3">Вітаємо, {user?.name || 'друже'}!</h1>
        <p className="text-ink/70 mb-8 leading-relaxed">Додайте свого першого улюбленця — і можна вести картку здоров’я.</p>
        <button onClick={() => openModal('addPet')}
          className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3.5 rounded-full font-medium hover:bg-ink/85 transition-colors">
          <Plus size={18} /> Додати улюбленця
        </button>
        <button onClick={logout} className="mt-6 text-ink/50 hover:text-ink text-sm flex items-center gap-1.5 mx-auto transition-colors">
          <LogOut size={14} /> Вийти
        </button>
      </div>
    </div>
  )
}
