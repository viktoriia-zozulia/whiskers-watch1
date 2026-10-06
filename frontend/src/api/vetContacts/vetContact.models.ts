export interface VetContact {
  id: number
  user_id: number
  doc_name: string | null
  clinic: string
  phone: string | null
}

export interface CreateVetContactDto {
  clinic: string
  doc_name?: string
  phone?: string
}

export type UpdateVetContactDto = Partial<Omit<VetContact, 'id' | 'user_id'>>
