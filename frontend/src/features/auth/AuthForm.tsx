import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { authApi } from '../../api'
import { useAuth } from '../../hooks/useAuth'
import { inputCls } from '../../shared/lib/styles'
import { GoogleSignInButton } from './GoogleSignInButton'

export type AuthMode = 'login' | 'register'

interface AuthFormProps {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  googleClientId?: string
}

export function AuthForm({ mode, onModeChange, googleClientId }: AuthFormProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const res = mode === 'login'
        ? await authApi.login({ email: email.trim(), password })
        : await authApi.register({ email: email.trim(), password, name: name.trim() })
      login(res.token, res.user)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Помилка сервера')
      setLoading(false)
    }
  }

  const switchMode = (m: AuthMode) => { onModeChange(m); setErr('') }

  return (
    <div>
      <div className="flex mb-6 bg-slate-100 rounded-xl p-1" role="tablist">
        {(['login', 'register'] as const).map(m => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => switchMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {m === 'login' ? 'Вхід' : 'Реєстрація'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === 'register' && (
          <div className="space-y-1">
            <label htmlFor="auth-name" className="text-sm font-medium text-slate-700">Ваше ім'я</label>
            <input id="auth-name" type="text" value={name} onChange={e => setName(e.target.value)} required maxLength={80}
              autoComplete="name" placeholder="Вікторія" className={inputCls} />
          </div>
        )}
        <div className="space-y-1">
          <label htmlFor="auth-email" className="text-sm font-medium text-slate-700">Email</label>
          <input id="auth-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
            autoComplete="email" placeholder="you@example.com" className={inputCls} />
        </div>
        <div className="space-y-1">
          <label htmlFor="auth-password" className="text-sm font-medium text-slate-700">Пароль</label>
          <input id="auth-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required
            minLength={mode === 'register' ? 6 : undefined}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder={mode === 'register' ? 'мінімум 6 символів' : ''} className={inputCls} />
        </div>

        {err && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" /> {err}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
          {loading && <Loader2 size={18} className="animate-spin" />}
          {mode === 'login' ? 'Увійти' : 'Створити акаунт'}
        </button>
      </form>

      {googleClientId && <GoogleSignInButton clientId={googleClientId} />}
    </div>
  )
}
