import { useEffect, useRef } from 'react'
import { FileHeart, FileText, Home, LogOut, Plus, Settings, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { usePet } from '../hooks/usePet'
import { useNav } from '../hooks/useNav'
import { usePushScheduler } from '../hooks/usePushScheduler'
import type { Page } from '../context/NavContext'
import { petAge } from '../shared/lib/format'
import { ThemeToggle } from '../shared/ui/ThemeToggle'
import { Logo } from '../shared/ui/Logo'
import { HomePage } from '../pages/HomePage'
import { MedicalPage } from '../pages/MedicalPage'
import { ProfilePage } from '../pages/ProfilePage'
import { SettingsPage } from '../pages/SettingsPage'
import { PetSwitcher } from '../features/pets/PetSwitcher'
import { AddPetModal } from '../features/pets/AddPetModal'
import { AddTaskModal } from '../features/home/AddTaskModal'
import { AddVetModal } from '../features/medical/AddVetModal'
import { AddMeasurementModal } from '../features/medical/AddMeasurementModal'
import { HealthPassportModal } from '../features/passport/HealthPassport'

const navItems = [
  ['home', Home, 'Головна', 'Головна'], ['medical', FileText, 'Медична карта', 'Картка'],
  ['profile', User, 'Профіль', 'Профіль'], ['settings', Settings, 'Налаштування', 'Опції'],
] as const satisfies readonly (readonly [Page, typeof Home, string, string])[]

// Sandbox accounts are temporary — say so, and offer a way to a real account.
function DemoBanner() {
  const { user, logout } = useAuth()
  if (!user?.is_demo) return null
  return (
    <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs sm:text-sm px-4 py-2 flex items-center justify-center gap-2 sm:gap-3 shrink-0">
            <span>Демо-режим: це ваша особиста пісочниця — змінюйте що завгодно. Дані зникнуть через 24 год.</span>
      <button onClick={() => { location.hash = '/signup'; logout() }} className="underline underline-offset-2 font-semibold whitespace-nowrap hover:no-underline">
        Створити акаунт
      </button>
    </div>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const { currentPet, pendingCount, modal, openModal, closeModal } = usePet()
  const { page, go } = useNav()
  const mainRef = useRef<HTMLElement>(null)
  usePushScheduler()

  // Each page starts at the top, like a real navigation.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
    window.scrollTo({ top: 0 })
  }, [page])

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800">
      <DemoBanner />
      <div className="flex-1 flex flex-col md:flex-row md:min-h-0">
        <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 shrink-0">
          <div className="px-6 h-20 flex items-center border-b border-slate-100">
            <Logo className="text-lg text-slate-800" />
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(([p, Icon, label]) => (
              <button key={p} onClick={() => go(p)} aria-current={page === p ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${page === p ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                <Icon size={20} /> {label}
              </button>
            ))}
            <button onClick={() => openModal('passport')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-slate-500 hover:bg-slate-50 hover:text-slate-700">
              <FileHeart size={20} /> Паспорт PDF
            </button>
          </nav>
          <div className="p-4 border-t border-slate-100 space-y-1">
            {user?.name && <p className="px-4 pb-2 text-xs text-slate-400 truncate">Ви увійшли як <b className="text-slate-500">{user.name}</b></p>}
            <ThemeToggle withLabel className="w-full px-4 py-2" />
            <button onClick={logout} className="w-full flex items-center gap-3 text-slate-400 hover:text-slate-600 px-4 py-2 font-medium transition-colors">
              <LogOut size={20} /> Вийти
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-0 md:h-full pb-20 md:pb-0">
          <header className="bg-white px-6 md:px-10 pt-6 md:pt-8 pb-5 shadow-sm z-10 shrink-0 lg:flex lg:justify-between lg:items-center">
            <div className="flex justify-between items-center mb-4 lg:mb-0">
              <PetSwitcher />
              <div className="flex gap-2 md:hidden">
                <ThemeToggle className="w-10 h-10 justify-center rounded-full bg-slate-100" />
                <button onClick={() => openModal('passport')} aria-label="Паспорт здоров’я"
                  className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                  <FileHeart size={19} />
                </button>
                <button onClick={() => openModal('addTask')} aria-label="Нове завдання"
                  className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-md shadow-teal-500/30">
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {page !== 'settings' && currentPet && (
              <div className="flex justify-between gap-3 lg:gap-6 lg:w-1/2 max-w-xl">
                <div className="flex-1 bg-teal-50 p-3 md:p-4 rounded-2xl text-center">
                  <p className="text-xs md:text-sm text-teal-600 font-medium mb-1">Вік</p>
                  <p className="font-bold text-slate-700 md:text-lg">{petAge(currentPet.birth_date)}</p>
                </div>
                <div className="flex-1 bg-blue-50 p-3 md:p-4 rounded-2xl text-center">
                  <p className="text-xs md:text-sm text-blue-600 font-medium mb-1">Вага</p>
                  <p className="font-bold text-slate-700 md:text-lg">{currentPet.weight ? `${currentPet.weight} кг` : '—'}</p>
                </div>
                <div className="flex-1 bg-orange-50 p-3 md:p-4 rounded-2xl text-center">
                  <p className="text-xs md:text-sm text-orange-600 font-medium mb-1">Сьогодні</p>
                  <p className="font-bold text-slate-700 md:text-lg">{pendingCount > 0 ? `${pendingCount} ⏰` : '0 ✓'}</p>
                </div>
              </div>
            )}
          </header>

          <main ref={mainRef} key={page} className="flex-1 px-4 sm:px-6 md:px-10 pt-6 md:pt-10 pb-24 md:pb-12 md:overflow-y-auto animate-in fade-in duration-300">
            {page === 'home' && <HomePage />}
            {page === 'medical' && <MedicalPage />}
            {page === 'profile' && <ProfilePage />}
            {page === 'settings' && <SettingsPage />}
          </main>

          <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-20 rounded-t-3xl shadow-lg">
            {navItems.map(([p, Icon, , shortLabel]) => (
              <button key={p} onClick={() => go(p)} aria-current={page === p ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 transition-colors ${page === p ? 'text-teal-600' : 'text-slate-400'}`}>
                <Icon size={22} />
                <span className="text-[10px] font-medium">{shortLabel}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {modal.addPet && <AddPetModal onClose={() => closeModal('addPet')} />}
      {modal.addTask && currentPet && <AddTaskModal onClose={() => closeModal('addTask')} />}
      {modal.addVet && <AddVetModal onClose={() => closeModal('addVet')} />}
      {modal.addMeasurement && currentPet && <AddMeasurementModal onClose={() => closeModal('addMeasurement')} />}
      {modal.passport && currentPet && <HealthPassportModal onClose={() => closeModal('passport')} />}
    </div>
  )
}
