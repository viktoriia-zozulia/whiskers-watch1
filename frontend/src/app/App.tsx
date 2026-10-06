import { Loader2 } from 'lucide-react'
import { AuthProvider } from '../context/AuthContext'
import { PetProvider } from '../context/PetContext'
import { NavProvider } from '../context/NavContext'
import { useAuth } from '../hooks/useAuth'
import { usePet } from '../hooks/usePet'
import { ToastHost } from '../shared/ui/ToastHost'
import { ErrorBoundary } from '../shared/ui/ErrorBoundary'
import { LandingPage } from '../pages/LandingPage'
import { WelcomePage } from '../pages/WelcomePage'
import { AppLayout } from './AppLayout'
import { AddPetModal } from '../features/pets/AddPetModal'

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2 size={32} className="animate-spin text-teal-500" />
        <p>Завантаження...</p>
      </div>
    </div>
  )
}

// Decides what to show once the user is authenticated.
function AuthenticatedApp() {
  const { loading, pets, modal, closeModal } = usePet()
  if (loading) return <FullScreenLoader />
  if (pets.length === 0) {
    return (
      <>
        <WelcomePage />
        {modal.addPet && <AddPetModal onClose={() => closeModal('addPet')} />}
      </>
    )
  }
  return <AppLayout />
}

function Routed() {
  const { user, checking } = useAuth()
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-teal-500" />
      </div>
    )
  }
  if (!user) return <LandingPage />
  return (
    <PetProvider>
      <NavProvider>
        <AuthenticatedApp />
      </NavProvider>
    </PetProvider>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastHost />
        <Routed />
      </AuthProvider>
    </ErrorBoundary>
  )
}

