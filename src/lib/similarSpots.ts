import { getDistanceMeters } from './distance'
import type { Spot } from '../types/spot'

export type SimilarSpot = {
  spot: Spot
  distance: number
  sharedEquipment: string[]
}

const DEFAULT_MAX_DISTANCE_METERS = 3000
const DEFAULT_LIMIT = 5

export function getSimilarSpots(
  currentSpot: Spot,
  allSpots: Spot[],
  maxDistanceMeters = DEFAULT_MAX_DISTANCE_METERS,
  limit = DEFAULT_LIMIT,
): SimilarSpot[] {
  if (currentSpot.lat === undefined || currentSpot.lng === undefined) return []

  const origin = { lat: currentSpot.lat, lng: currentSpot.lng }

  return allSpots
    .filter((candidate) => candidate.id !== currentSpot.id)
    .filter((candidate) => candidate.lat !== undefined && candidate.lng !== undefined)
    .map((candidate) => {
      const sharedEquipment = candidate.equipment.filter((item) => currentSpot.equipment.includes(item))
      const distance = getDistanceMeters(origin, { lat: candidate.lat!, lng: candidate.lng! })

      return { spot: candidate, distance, sharedEquipment }
    })
    .filter((entry) => entry.sharedEquipment.length > 0 && entry.distance <= maxDistanceMeters)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
}

export function getSimilarSpotsTitle(entries: SimilarSpot[]): string {
  if (entries.length === 0) return 'Spots similaires'

  const primaryEquipment = entries[0].sharedEquipment[0]?.toLowerCase() ?? 'équipements similaires'
  return `Spots avec ${primaryEquipment} à moins de 3 km`
}

export function formatSimilarDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}
