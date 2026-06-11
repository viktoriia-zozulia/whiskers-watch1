import { createContext, useState, type ReactNode } from 'react'

export type Page = 'home' | 'medical' | 'profile' | 'settings'

interface NavContextValue {
  page: Page
  go: (page: Page) => void
}

export const NavContext = createContext<NavContextValue | null>(null)

export function NavProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>('home')
  return (
    <NavContext.Provider value={{ page, go: setPage }}>
      {children}
    </NavContext.Provider>
  )
}
