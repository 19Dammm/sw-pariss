import type { AccessFilterKey } from './access'
import { spotMatchesAccess } from './access'
import type { Spot } from '../types/spot'

export function spotMatchesEquipment(spot: Spot, equipment: string[]): boolean {
  if (equipment.length === 0) return true
  return equipment.every((name) => spot.equipment.includes(name))
}

export function filterSpots(
  spots: Spot[],
  {
    query,
    arrondissement,
    appliedEquipment,
    accessFilters,
  }: {
    query: string
    arrondissement: string
    appliedEquipment: string[]
    accessFilters: AccessFilterKey[]
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

    return arrondissementMatch && queryMatch && equipmentMatch && accessMatch
  })
}

export function countMatchingSpots(
  spots: Spot[],
  appliedEquipment: string[],
  accessFilters: AccessFilterKey[],
): number {
  return spots.filter(
    (spot) => spotMatchesEquipment(spot, appliedEquipment) && spotMatchesAccess(spot, accessFilters),
  ).length
}
