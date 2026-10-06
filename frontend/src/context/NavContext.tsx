import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'

export type Page = 'home' | 'medical' | 'profile' | 'settings'

const PAGES: readonly Page[] = ['home', 'medical', 'profile', 'settings']

interface NavContextValue {
  page: Page
  go: (page: Page) => void
}

export const NavContext = createContext<NavContextValue | null>(null)

// Hash-based routing (#/medical): survives reloads, supports back/forward and
// deep links, and needs no server-side rewrites when deployed as static files.
function pageFromHash(): Page {
  const name = window.location.hash.replace(/^#\/?/, '')
  return (PAGES as readonly string[]).includes(name) ? (name as Page) : 'home'
}

export function NavProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>(pageFromHash)

  useEffect(() => {
    const onHash = () => setPage(pageFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = useCallback((next: Page) => {
    if (next !== pageFromHash()) window.location.hash = `/${next}`
    setPage(next)
  }, [])

  return (
    <NavContext.Provider value={{ page, go }}>
      {children}
    </NavContext.Provider>
  )
}
