import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'
const KEY = 'ww_theme'

// The `dark` class on <html> is the single source of truth (set before first
// paint by an inline script in index.html), so every toggle stays in sync.

const listeners = new Set<() => void>()
const current = (): Theme => document.documentElement.classList.contains('dark') ? 'dark' : 'light'

function storedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

function setTheme(theme: Theme, persist: boolean) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  if (persist) {
    try { localStorage.setItem(KEY, theme) } catch { /* private mode */ }
  }
  listeners.forEach(l => l())
}

// Follow OS changes until the user picks a theme explicitly.
if (typeof window !== 'undefined') {
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!storedTheme()) setTheme(e.matches ? 'dark' : 'light', false)
  })
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, current, () => 'light' as Theme)
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark', true)
  return { theme, toggle }
}
