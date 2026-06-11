import { Activity, FileText, Home, LogOut, Plus, Settings, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { usePet } from '../hooks/usePet'
import { useNav } from '../hooks/useNav'
import { usePushScheduler } from '../hooks/usePushScheduler'
import type { Page } from '../context/NavContext'
import { PetAvatar } from '../shared/ui/PetAvatar'
import { petAge } from '../shared/lib/format'
import { HomePage } from '../pages/HomePage'
import { MedicalPage } from '../pages/MedicalPage'
import { ProfilePage } from '../pages/ProfilePage'
import { SettingsPage } from '../pages/SettingsPage'
import { PetSwitcher } from '../features/pets/PetSwitcher'
import { AddPetModal } from '../features/pets/AddPetModal'
import { AddTaskModal } from '../features/home/AddTaskModal'
import { AddVetModal } from '../features/medical/AddVetModal'
import { AddMeasurementModal } from '../features/medical/AddMeasurementModal'

const navItems = [
  ['home', Home, 'Головна'], ['medical', FileText, 'Медична карта'],
  ['profile', User, 'Профіль'], ['settings', Settings, 'Налаштування'],
] as const satisfies readonly (readonly [Page, typeof Home, string])[]

const mobileNav = [
  ['home', Home, 'Головна'], ['medical', FileText, 'Картка'],
  ['profile', User, 'Профіль'], ['settings', Settings, 'Опції'],
] as const satisfies readonly (readonly [Page, typeof Home, string])[]

export function AppLayout() {
  const { logout } = useAuth()
  const { currentPet, pendingCount, modal, openModal, closeModal } = usePet()
  const { page, go } = useNav()
  usePushScheduler()

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-2 text-teal-600 font-bold text-xl border-b border-slate-100">
          <Activity size={28} /> WhiskersWatch
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(([p, Icon, label]) => (
            <button key={p} onClick={() => go(p)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${page === p ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              <Icon size={20} /> {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={logout} className="w-full flex items-center gap-3 text-slate-400 hover:text-slate-600 px-4 py-2 font-medium transition-colors">
            <LogOut size={20} /> Вийти
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen md:min-h-0 md:h-screen pb-20 md:pb-0">
        <header className="bg-white px-6 md:px-10 pt-8 pb-5 shadow-sm z-10 shrink-0 lg:flex lg:justify-between lg:items-center">
          <div className="flex justify-between items-center mb-4 lg:mb-0">
            <PetSwitcher />
            <div className="flex gap-2 lg:hidden">
              <button onClick={() => openModal('addTask')} className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
                <Plus size={20} />
              </button>
            </div>
          </div>

          {page !== 'settings' && currentPet && (
            <div className="flex justify-between gap-3 lg:gap-6 lg:w-1/2 max-w-xl">
              <div className="flex-1 bg-teal-50 p-3 md:p-4 rounded-2xl text-center shadow-sm">
                <p className="text-xs md:text-sm text-teal-600 font-medium mb-1">Вік</p>
                <p className="font-bold text-slate-700 md:text-lg">{petAge(currentPet.birth_date)}</p>
              </div>
              <div className="flex-1 bg-blue-50 p-3 md:p-4 rounded-2xl text-center shadow-sm">
                <p className="text-xs md:text-sm text-blue-600 font-medium mb-1">Вага</p>
                <p className="font-bold text-slate-700 md:text-lg">{currentPet.weight ? `${currentPet.weight} кг` : '—'}</p>
              </div>
              <div className="flex-1 bg-orange-50 p-3 md:p-4 rounded-2xl text-center shadow-sm">
                <p className="text-xs md:text-sm text-orange-600 font-medium mb-1">Завдань</p>
                <p className="font-bold text-slate-700 md:text-lg">{pendingCount > 0 ? `${pendingCount} ⏰` : '0 ✓'}</p>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 px-6 md:px-10 pt-6 md:pt-10 pb-24 md:pb-12 overflow-y-auto">
          {page === 'home' && <HomePage />}
          {page === 'medical' && <MedicalPage />}
          {page === 'profile' && <ProfilePage />}
          {page === 'settings' && <SettingsPage />}
        </main>

        <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-20 rounded-t-3xl shadow-lg">
          {mobileNav.map(([p, Icon, label]) => (
            <button key={p} onClick={() => go(p)}
              className={`flex flex-col items-center gap-1 transition-colors ${page === p ? 'text-teal-600' : 'text-slate-400'}`}>
              <Icon size={22} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {modal.addPet && <AddPetModal onClose={() => closeModal('addPet')} />}
      {modal.addTask && currentPet && <AddTaskModal onClose={() => closeModal('addTask')} />}
      {modal.addVet && <AddVetModal onClose={() => closeModal('addVet')} />}
      {modal.addMeasurement && currentPet && <AddMeasurementModal onClose={() => closeModal('addMeasurement')} />}
    </div>
  )
}
