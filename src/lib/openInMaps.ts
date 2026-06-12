import type { Spot } from '../types/spot'

type MapsProvider = 'google' | 'apple' | 'waze'

export function buildMapsUrl(provider: MapsProvider, spot: Spot) {
  const destination = encodeURIComponent(`${spot.lat},${spot.lng}`)
  const address = encodeURIComponent(spot.address)

  if (provider === 'google') {
    return `https://www.google.com/maps/search/?api=1&query=${destination}`
  }

  if (provider === 'apple') {
    return `https://maps.apple.com/?ll=${destination}&q=${address}`
  }

  return `https://waze.com/ul?ll=${destination}&navigate=yes`
}

