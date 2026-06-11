import { FileText, Loader2, Trash2 } from 'lucide-react'
import { usePet } from '../../hooks/usePet'
import { useFilteredRecords } from '../../hooks/useFilteredRecords'
import { formatDate } from '../../shared/lib/format'
import { getRecordDot } from '../../shared/lib/icons'
import { RecordFilter } from './RecordFilter'

export function HealthHistory() {
  const { currentPet, recordsVersion, deleteRecord } = usePet()
  const { records, loading, type, setType, search, setSearch } =
    useFilteredRecords(currentPet?.id, recordsVersion)

  const isFiltering = type !== '' || search !== ''

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Повна історія здоров'я</h2>
        <span className="text-sm text-slate-400 flex items-center gap-2">
          {loading && <Loader2 size={14} className="animate-spin text-teal-500" />}
          {records.length} записів
        </span>
      </div>

      <RecordFilter type={type} search={search} onType={setType} onSearch={setSearch} />

      {records.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <FileText size={32} className="mx-auto mb-2 text-slate-200" />
          <p>{isFiltering ? 'Нічого не знайдено за цим фільтром.' : 'Записів ще немає. Використовуйте «Швидкий запис» на головній.'}</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
          {records.map(item => (
            <div key={item.id} className="relative pl-6 group">
              <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${getRecordDot(item.record_type)}`} />
              </div>
              <p className="text-sm font-semibold text-slate-400 mb-1">{formatDate(item.record_date)}</p>
              <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 relative">
                <p className="text-xs font-semibold text-slate-400 mb-1">{item.record_type}</p>
                {item.text && <p className="text-base text-slate-700 leading-relaxed">{item.text}</p>}
                {item.photo_url && <img src={item.photo_url} alt="" className="mt-2 rounded-xl max-h-72 object-cover" />}
                <button onClick={() => deleteRecord(item.id)}
                  className="absolute top-3 right-3 md:opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
