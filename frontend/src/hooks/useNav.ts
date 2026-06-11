import { useContext } from 'react'
import { NavContext } from '../context/NavContext'

export function useNav() {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav must be used within <NavProvider>')
  return ctx
}
