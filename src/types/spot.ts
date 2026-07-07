export type Spot = {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  transport?: {
    metro?: string[]
    bus?: string[]
    velib?: {
      distance: number    // en mètres
      stationName: string // nom de la borne
    }
  }
  arrondissement: string
  equipment: string[]
  ground?: "béton" | "tartan" | "gazon" | "sable" | "dalle"
  /** Infos notables (éclairage, affluence, accès, etc.) */
  note?: string
}

