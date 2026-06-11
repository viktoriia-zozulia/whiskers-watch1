import { useEffect, useState } from 'react'
import { Brain, Loader2 } from 'lucide-react'
import { usePet } from '../../hooks/usePet'
import { computeHealthData, insightCfg } from './lib/healthAnalysis'

function HealthScoreGauge({ score }: { score: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const arc = (score / 100) * circ * 0.75
  const color = score >= 70 ? '#0d9488' : score >= 50 ? '#f59e0b' : '#ef4444'
  const label = score >= 70 ? 'Добре' : score >= 50 ? 'Норма' : 'Увага!'
  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: 80, height: 80 }}>
      <svg viewBox="0 0 88 88" className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(135deg)' }}>
        <circle cx="44" cy="44" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={`${arc} ${circ - arc}`}
          style={{ transition: 'stroke-dasharray 1.2s ease-out' }} />
      </svg>
      <div className="relative text-center leading-none">
        <p className="text-xl font-extrabold text-slate-800">{score}</p>
        <p className="text-[9px] font-bold uppercase tracking-wide mt-0.5" style={{ color }}>{label}</p>
      </div>
    </div>
  )
}

export function HealthInsights() {
  const { currentPet, records, tasks, measurements } = usePet()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    const t = setTimeout(() => setReady(true), 700)
    return () => clearTimeout(t)
  }, [currentPet?.id])

  if (!currentPet) return null
  const { score, insights } = computeHealthData(currentPet, records, tasks, measurements)

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain size={17} className="text-teal-500" />
            <h3 className="font-bold text-slate-800 text-base">WhiskersAI</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Аналіз стану здоров'я</p>
        </div>
        {ready
          ? <HealthScoreGauge score={score} />
          : <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-3"><Loader2 size={13} className="animate-spin" /> Аналізую дані...</div>
        }
      </div>
      {ready && (
        <div className="space-y-2">
          {insights.slice(0, 5).map((ins, i) => {
            const cfg = insightCfg[ins.sev]
            return (
              <div key={i} className={`${cfg.bg} border ${cfg.border} rounded-xl p-2.5 flex items-start gap-2`}>
                <span className="text-sm shrink-0">{cfg.emoji}</span>
                <div>
                  <p className={`text-xs font-bold ${cfg.text}`}>{ins.title}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{ins.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
