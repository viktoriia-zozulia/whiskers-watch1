import { useContext } from 'react'
import { PetContext } from '../context/PetContext'

export function usePet() {
  const ctx = useContext(PetContext)
  if (!ctx) throw new Error('usePet must be used within <PetProvider>')
  return ctx
}
