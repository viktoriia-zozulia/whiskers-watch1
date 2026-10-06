import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../lib/theme'

export function ThemeToggle({ withLabel = false, className = '' }: { withLabel?: boolean; className?: string }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  const label = dark ? 'Світла тема' : 'Темна тема'
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label}
      className={`flex items-center gap-3 text-slate-400 hover:text-slate-600 transition-colors ${className}`}>
      <span className="relative w-5 h-5">
        <Sun size={20} className={`absolute inset-0 transition-all duration-300 ${dark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
        <Moon size={20} className={`absolute inset-0 transition-all duration-300 ${dark ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
      </span>
      {withLabel && <span className="font-medium">{label}</span>}
    </button>
  )
}
