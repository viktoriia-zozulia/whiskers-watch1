export interface Pet {
  id: number
  user_id: number
  name: string
  species: string
  breed: string | null
  birth_date: string | null
  weight: number | null
  allergies: string | null
  photo_url: string | null
}

export type CreatePetDto = Omit<Pet, 'id' | 'user_id'>
export type UpdatePetDto = Partial<CreatePetDto>
