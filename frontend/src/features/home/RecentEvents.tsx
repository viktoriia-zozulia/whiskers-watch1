import { ChevronRight } from 'lucide-react'
import { usePet } from '../../hooks/usePet'
import { useNav } from '../../hooks/useNav'
import { formatDate } from '../../shared/lib/format'
import { getRecordDot } from '../../shared/lib/icons'

export function RecentEvents() {
  const { records } = usePet()
  const { go } = useNav()

  return (
    <section className="bg-white rounded-3xl p-5 md:p-6 xl:p-8 shadow-sm border border-slate-200">
      <div className="flex justify-between items-center gap-3 mb-6">
        <h2 className="text-lg md:text-xl font-bold">Останні події</h2>
        <button onClick={() => go('medical')} className="text-teal-600 text-sm font-medium hover:underline flex items-center gap-1 whitespace-nowrap shrink-0">
          Вся історія <ChevronRight size={14} />
        </button>
      </div>
      {records.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">Записів ще немає</p>
      ) : (
        <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
          {records.slice(0, 4).map(item => (
            <div key={item.id} className="relative pl-6">
              <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${getRecordDot(item.record_type)}`} />
              </div>
              <p className="text-xs md:text-sm font-semibold text-slate-400 mb-1">{formatDate(item.record_date)}</p>
              <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                <p className="text-xs font-medium text-slate-400 mb-1">{item.record_type}</p>
                {item.text && <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>}
                {item.photo_url && <img src={item.photo_url} alt="" className="mt-2 rounded-lg max-h-40 object-cover w-full" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
