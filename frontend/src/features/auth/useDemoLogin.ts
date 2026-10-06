import { useState } from 'react'
import { authApi } from '../../api'
import { useAuth } from '../../hooks/useAuth'
import { toast } from '../../shared/lib/toast'

/** Signs the visitor into a fresh sandbox account pre-filled with sample data. */
export function useDemoLogin() {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  async function start() {
    setLoading(true)
    try {
      const res = await authApi.demo()
      login(res.token, res.user)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Не вдалося запустити демо')
      setLoading(false)
    }
  }

  return { start, loading }
}
