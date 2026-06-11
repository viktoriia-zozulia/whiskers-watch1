import { createContext, useEffect, useState, type ReactNode } from 'react'
import { clearToken, getToken, petsApi, setToken, type User } from '../http_client'

interface AuthContextValue {
  user: User | null
  checking: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

// Decode a JWT payload without verifying — used only to restore a session id.
function decodeUserId(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/')))
    return payload.userId ?? null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) { setChecking(false); return }
    petsApi.list()
      .then(() => {
        const id = decodeUserId(token)
        if (id != null) setUser({ id, email: '', name: '' })
        else clearToken()
      })
      .catch(() => clearToken())
      .finally(() => setChecking(false))
  }, [])

  const login = (token: string, u: User) => { setToken(token); setUser(u) }
  const logout = () => { clearToken(); setUser(null) }

  return (
    <AuthContext.Provider value={{ user, checking, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
