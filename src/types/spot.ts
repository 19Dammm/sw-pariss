export type SpotAccess = {
  open24h?: boolean
  litAtNight?: boolean
  covered?: boolean
}

export type SpotRating = {
  average: number
  count: number
}

export type Spot = {
  id: string
  name: string
  lat?: number
  lng?: number
  address: string
  transport?: {
    metro?: string[]
    bus?: string[]
    velib?: {
      distance: number
      stationName: string
    }
  }
  arrondissement: string
  image?: string | string[]
  equipment: string[]
  ground?: 'béton' | 'tartan' | 'gazon' | 'sable' | 'dalle'
  isVerified?: boolean
  /** Infos notables (éclairage, affluence, accès, etc.) */
  note?: string
  access?: SpotAccess
  rating?: SpotRating
}
