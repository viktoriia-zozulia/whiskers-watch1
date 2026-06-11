import type { Pet } from '../../http_client'
import { speciesEmoji } from '../lib/format'

export function PetAvatar({ pet, size = 56 }: { pet: Pet | null; size?: number }) {
  if (pet?.photo_url) {
    return <img src={pet.photo_url} alt={pet.name}
      className="rounded-full object-cover border-2 border-teal-200" style={{ width: size, height: size }} />
  }
  return (
    <div className="rounded-full bg-teal-100 flex items-center justify-center border-2 border-teal-200"
      style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {speciesEmoji(pet?.species)}
    </div>
  )
}
