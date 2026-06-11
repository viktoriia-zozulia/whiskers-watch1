import { Plus, Scale } from 'lucide-react'
import { usePet } from '../../hooks/usePet'
import { WeightChart } from './WeightChart'

export function WeightTracking() {
  const { measurements, openModal } = usePet()

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Scale className="text-blue-600" /> Контроль ваги</h2>
        <button onClick={() => openModal('addMeasurement')} className="text-teal-600 text-sm font-medium hover:underline flex items-center gap-1">
          <Plus size={16} /> Зважити
        </button>
      </div>
      {measurements.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">Ще немає вимірювань ваги.</p>
      ) : (
        <div className="space-y-4">
          <WeightChart measurements={measurements} />
          <div className="space-y-2">
            {measurements.map((m, i) => {
              const prev = measurements[i + 1]
              const delta = prev ? m.weight_kg - prev.weight_kg : 0
              return (
                <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-700">{m.weight_kg} кг
                      {delta !== 0 && (
                        <span className={`ml-2 text-xs font-medium ${delta > 0 ? 'text-orange-500' : 'text-teal-600'}`}>
                          {delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(2)} кг
                        </span>
                      )}
                    </p>
                    {m.notes && <p className="text-xs text-slate-400 mt-0.5">{m.notes}</p>}
                  </div>
                  <span className="text-sm text-slate-400">{new Date(m.date_measured).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
