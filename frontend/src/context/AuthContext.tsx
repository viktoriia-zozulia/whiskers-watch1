import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { authApi, clearToken, getToken, setToken, SESSION_EXPIRED_EVENT, type User } from '../api'
import { toast } from '../shared/lib/toast'

interface AuthContextValue {
  user: User | null
  checking: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const userRef = useRef(user)
  userRef.current = user

  // Restore the session (with the real name/email) on page load.
  useEffect(() => {
    if (!getToken()) { setChecking(false); return }
    authApi.me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setChecking(false))
  }, [])

  // Any 401 from the API means the token is no longer valid.
  useEffect(() => {
    const onExpired = () => {
      if (userRef.current) toast('Сесію завершено. Увійдіть знову.', 'info')
      userRef.current = null // several requests may fail at once — toast only once
      setUser(null)
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [])

  const login = useCallback((token: string, u: User) => { setToken(token); setUser(u) }, [])
  const logout = useCallback(() => { clearToken(); setUser(null) }, [])

  return (
    <AuthContext.Provider value={{ user, checking, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
