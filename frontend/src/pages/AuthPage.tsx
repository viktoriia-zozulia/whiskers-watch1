import { Activity } from 'lucide-react'
import { AuthForm } from '../features/auth/AuthForm'

export function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8 text-teal-600">
          <Activity size={36} />
          <span className="text-3xl font-bold text-slate-800">WhiskersWatch</span>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
