import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { authApi } from '../../http_client'
import { useAuth } from '../../hooks/useAuth'
import { inputCls } from '../../shared/lib/styles'
import { GoogleSignInButton } from './GoogleSignInButton'

export function AuthForm() {
  const { login } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
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
        ? await authApi.login({ email, password })
        : await authApi.register({ email, password, name })
      login(res.token, res.user)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Помилка сервера')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100">
      <div className="flex mb-6 bg-slate-100 rounded-2xl p-1">
        <button onClick={() => { setMode('login'); setErr('') }}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${mode === 'login' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}>
          Вхід
        </button>
        <button onClick={() => { setMode('register'); setErr('') }}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${mode === 'register' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}>
          Реєстрація
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === 'register' && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Ваше ім'я</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="Вікторія" className={inputCls} />
          </div>
        )}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="you@example.com" className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Пароль</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            placeholder="мінімум 6 символів" className={inputCls} />
        </div>

        {err && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" /> {err}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 mt-2">
          {loading && <Loader2 size={18} className="animate-spin" />}
          {mode === 'login' ? 'Увійти' : 'Створити акаунт'}
        </button>
      </form>

      <GoogleSignInButton />
    </div>
  )
}
