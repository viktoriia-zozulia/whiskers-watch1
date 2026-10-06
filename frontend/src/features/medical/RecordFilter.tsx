import { Search, X } from 'lucide-react'

export const RECORD_TYPES = ['Нотатка', 'Симптом', 'Ліки', 'Вакцина', 'Лікар']

export function RecordFilter({
  type, search, onType, onSearch,
}: {
  type: string
  search: string
  onType: (t: string) => void
  onSearch: (s: string) => void
}) {
  return (
    <div className="space-y-3 mb-5">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Пошук у записах..."
          className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder:text-slate-300"
        />
        {search && (
          <button onClick={() => onSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
            <X size={15} />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onType('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${type === '' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
          Всі
        </button>
        {RECORD_TYPES.map(t => (
          <button key={t} onClick={() => onType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${type === t ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}
