import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { dismissToast, useToasts } from '../lib/toast'

export function ToastHost() {
  const toasts = useToasts()
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[calc(100vw-2rem)] w-80">
      {toasts.map(t => {
        const cfg = t.type === 'success'
          ? { Icon: CheckCircle, cls: 'border-teal-200 bg-teal-50 text-teal-800', iconCls: 'text-teal-500' }
          : t.type === 'info'
          ? { Icon: Info, cls: 'border-blue-200 bg-blue-50 text-blue-800', iconCls: 'text-blue-500' }
          : { Icon: AlertCircle, cls: 'border-red-200 bg-red-50 text-red-800', iconCls: 'text-red-500' }
        return (
          <div key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-md animate-[slideIn_0.2s_ease-out] ${cfg.cls}`}>
            <cfg.Icon size={18} className={`shrink-0 mt-0.5 ${cfg.iconCls}`} />
            <p className="text-sm flex-1 leading-snug">{t.msg}</p>
            <button onClick={() => dismissToast(t.id)} className="shrink-0 opacity-50 hover:opacity-100">
              <X size={15} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
