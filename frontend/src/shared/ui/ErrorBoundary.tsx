import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props { children: ReactNode }
interface State { error: Error | null }

// Catches render-time errors anywhere below it so a single broken component
// can't blank the whole app. Shows a friendly fallback with a reload action.
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Перехоплено помилку інтерфейсу:', error, info.componentStack)
  }

  override render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={30} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Щось пішло не так</h2>
            <p className="text-slate-500 text-sm mb-6">
              Сталася неочікувана помилка в інтерфейсі. Спробуйте перезавантажити сторінку.
            </p>
            <button onClick={() => location.reload()}
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto transition-colors">
              <RefreshCw size={18} /> Перезавантажити
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
