import { useEffect, useRef, useState } from 'react'
import { authApi } from '../../http_client'
import { useAuth } from '../../hooks/useAuth'
import { toast } from '../../shared/lib/toast'

// Minimal typing for the Google Identity Services global.
interface GoogleId {
  accounts: {
    id: {
      initialize: (cfg: { client_id: string; callback: (res: { credential: string }) => void }) => void
      renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void
    }
  }
}
declare global {
  interface Window { google?: GoogleId }
}

const GIS_SRC = 'https://accounts.google.com/gsi/client'

function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve()
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('gis')))
      return
    }
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('gis'))
    document.head.appendChild(script)
  })
}

export function GoogleSignInButton() {
  const { login } = useAuth()
  const [clientId, setClientId] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Discover whether Google sign-in is enabled on the server.
  useEffect(() => {
    authApi.config()
      .then(c => setClientId(c.googleClientId))
      .catch(() => setClientId(''))
  }, [])

  useEffect(() => {
    if (!clientId || !containerRef.current) return
    let cancelled = false

    loadGisScript()
      .then(() => {
        if (cancelled || !window.google || !containerRef.current) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            try {
              const res = await authApi.google(credential)
              login(res.token, res.user)
            } catch (e) {
              toast(e instanceof Error ? e.message : 'Не вдалося увійти через Google')
            }
          },
        })
        containerRef.current.innerHTML = ''
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline', size: 'large', width: 320, text: 'continue_with', shape: 'pill',
        })
      })
      .catch(() => { if (!cancelled) toast('Не вдалося завантажити Google Sign-In') })

    return () => { cancelled = true }
  }, [clientId, login])

  if (!clientId) return null

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px bg-slate-200 flex-1" />
        <span className="text-xs text-slate-400">або</span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>
      <div ref={containerRef} className="flex justify-center" />
    </div>
  )
}
