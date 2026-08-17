import type { AccessFilterKey } from './access'
import { spotMatchesAccess } from './access'
import type { Spot } from '../types/spot'

export function spotMatchesEquipment(spot: Spot, equipment: string[]): boolean {
  if (equipment.length === 0) return true
  return equipment.every((name) => spot.equipment.includes(name))
}

export function spotMatchesGround(spot: Spot, groundFilters: string[]): boolean {
  if (groundFilters.length === 0) return true
  if (!spot.ground) return false
  return groundFilters.includes(spot.ground)
}

export function filterSpots(
  spots: Spot[],
  {
    query,
    arrondissement,
    appliedEquipment,
    accessFilters,
    groundFilters,
  }: {
    query: string
    arrondissement: string
    appliedEquipment: string[]
    accessFilters: AccessFilterKey[]
    groundFilters: string[]
  },
): Spot[] {
  const normalizedQuery = query.trim().toLowerCase()

  return spots.filter((spot) => {
    const arrondissementMatch = !arrondissement || spot.arrondissement === arrondissement
    const queryMatch =
      !normalizedQuery ||
      spot.name.toLowerCase().includes(normalizedQuery) ||
      spot.address.toLowerCase().includes(normalizedQuery) ||
      (spot.note?.toLowerCase().includes(normalizedQuery) ?? false)
    const equipmentMatch = spotMatchesEquipment(spot, appliedEquipment)
    const accessMatch = spotMatchesAccess(spot, accessFilters)
    const groundMatch = spotMatchesGround(spot, groundFilters)

    return arrondissementMatch && queryMatch && equipmentMatch && accessMatch && groundMatch
  })
}

export function countMatchingSpots(
  spots: Spot[],
  appliedEquipment: string[],
  accessFilters: AccessFilterKey[],
  groundFilters: string[],
): number {
  return spots.filter(
    (spot) =>
      spotMatchesEquipment(spot, appliedEquipment) &&
      spotMatchesAccess(spot, accessFilters) &&
      spotMatchesGround(spot, groundFilters),
  ).length
}