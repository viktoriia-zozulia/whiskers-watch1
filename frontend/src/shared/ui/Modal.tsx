import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

// Accessible dialog shell shared by every modal: closes on Esc or a click on
// the backdrop, focuses the first field, locks page scroll and animates in.
export function Modal({ title, onClose, children, size = 'sm' }: ModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector<HTMLElement>('input:not([type=file]), select, textarea')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4 animate-in fade-in duration-200"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId}
        className={`bg-white w-full ${{ sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-2xl' }[size]} rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200`}>
        <div className="flex justify-between items-center mb-5">
          <h2 id={titleId} className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Закрити"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Cancel / Save row used at the bottom of every modal form. */
export function ModalActions({ onCancel, loading, disabled, label = 'Зберегти' }: {
  onCancel: () => void
  loading: boolean
  disabled?: boolean
  label?: string
}) {
  return (
    <div className="flex gap-3 pt-1">
      <button type="button" onClick={onCancel}
        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
        Скасувати
      </button>
      <button type="submit" disabled={loading || disabled}
        className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors">
        {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />} {label}
      </button>
    </div>
  )
}
