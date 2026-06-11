import type { Measurement } from '../../http_client'

// Smooth SVG sparkline of the last 12 weight measurements.
export function WeightChart({ measurements }: { measurements: Measurement[] }) {
  const sorted = [...measurements]
    .sort((a, b) => a.date_measured.localeCompare(b.date_measured))
    .slice(-12)

  if (sorted.length < 2) return null

  const weights = sorted.map(m => m.weight_kg)
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  const range = maxW - minW || 0.1
  const W = 300, H = 80, PAD = 10

  const pts = sorted.map((m, i) => ({
    x: PAD + (i / (sorted.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (m.weight_kg - minW) / range) * (H - PAD * 2),
  }))

  let linePath = `M ${pts[0]!.x} ${pts[0]!.y}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1]!; const c = pts[i]!
    const mx = (p.x + c.x) / 2
    linePath += ` C ${mx} ${p.y}, ${mx} ${c.y}, ${c.x} ${c.y}`
  }
  const last = pts[pts.length - 1]!; const first = pts[0]!
  const fillPath = `${linePath} L ${last.x} ${H} L ${first.x} ${H} Z`

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{new Date(sorted[0]!.date_measured).toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' })}</span>
        <span>{new Date(sorted[sorted.length - 1]!.date_measured).toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' })}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">
        <defs>
          <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill="url(#wGrad)" />
        <path d={linePath} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((pt, i) => (
          <g key={i}>
            {i === pts.length - 1 && <circle cx={pt.x} cy={pt.y} r={8} fill="#0d9488" fillOpacity={0.12} />}
            <circle cx={pt.x} cy={pt.y} r={i === pts.length - 1 ? 4 : 2.5}
              fill={i === pts.length - 1 ? '#0d9488' : '#fff'} stroke="#0d9488" strokeWidth="2" />
          </g>
        ))}
      </svg>
    </div>
  )
}
