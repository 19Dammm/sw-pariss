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
  equipment: string[]
  ground?: "béton" | "tartan" | "gazon" | "sable" | "dalle"
  isVerified?: boolean
  /** Infos notables (éclairage, affluence, accès, etc.) */
  note?: string
}