import { useEffect, useState } from 'react'

export type ToastType = 'error' | 'success' | 'info'
export interface ToastItem {
  id: number
  msg: string
  type: ToastType
}

let toasts: ToastItem[] = []
let listeners: Array<(t: ToastItem[]) => void> = []

function emit() {
  for (const l of listeners) l(toasts)
}

export function toast(msg: string, type: ToastType = 'error') {
  const id = Date.now() + Math.random()
  toasts = [...toasts, { id, msg, type }]
  emit()
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    emit()
  }, 4000)
}

export function dismissToast(id: number) {
  toasts = toasts.filter(t => t.id !== id)
  emit()
}

export function useToasts(): ToastItem[] {
  const [state, setState] = useState<ToastItem[]>(toasts)
  useEffect(() => {
    listeners.push(setState)
    return () => {
      listeners = listeners.filter(l => l !== setState)
    }
  }, [])
  return state
}
