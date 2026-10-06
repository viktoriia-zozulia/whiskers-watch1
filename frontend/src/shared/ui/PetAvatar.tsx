import type { Pet } from '../../api'
import { speciesEmoji } from '../lib/format'

export function PetAvatar({ pet, size = 56 }: { pet: Pet | null; size?: number }) {
  const border = size >= 40 ? 'border-2' : 'border'
  if (pet?.photo_url) {
    return <img src={pet.photo_url} alt={pet.name}
      className={`rounded-full object-cover shrink-0 ${border} border-teal-200`} style={{ width: size, height: size }} />
  }
  return (
    <div className={`rounded-full bg-gradient-to-br from-teal-50 to-teal-200 flex items-center justify-center shrink-0 ${border} border-teal-200`}
      style={{ width: size, height: size, fontSize: size * 0.48 }} aria-hidden>
      {speciesEmoji(pet?.species)}
    </div>
  )
}
