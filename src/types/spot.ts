export type Spot = {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  arrondissement: string
  equipment: string[]
  /** Infos notables (éclairage, affluence, accès, etc.) */
  note?: string
}

