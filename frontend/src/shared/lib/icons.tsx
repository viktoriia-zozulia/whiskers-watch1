import { Activity, Pill, Stethoscope, Syringe } from 'lucide-react'

export function getTypeIcon(type: string, size = 18) {
  const t = type.toLowerCase()
  if (t.includes('pill') || t.includes('medication') || t.includes('ліки'))
    return <Pill size={size} className="text-teal-600" />
  if (t.includes('vet') || t.includes('clinic') || t.includes('лікар'))
    return <Stethoscope size={size} className="text-blue-600" />
  if (t.includes('vaccine') || t.includes('вакцин') || t.includes('щеплення'))
    return <Syringe size={size} className="text-purple-600" />
  return <Activity size={size} className="text-orange-600" />
}

export function getRecordDot(type: string) {
  const t = type.toLowerCase()
  if (t.includes('vet') || t.includes('clinic') || t.includes('лікар')) return 'bg-blue-500'
  if (t.includes('pill') || t.includes('medication') || t.includes('ліки')) return 'bg-teal-500'
  if (t.includes('vaccine') || t.includes('вакцин')) return 'bg-purple-500'
  if (t.includes('symptom') || t.includes('симптом') || t.includes('нотатк')) return 'bg-slate-400'
  return 'bg-orange-400'
}
