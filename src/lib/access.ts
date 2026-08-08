import type { Spot, SpotAccess } from '../types/spot'

export type AccessFilterKey = keyof SpotAccess

export const ACCESS_FILTER_LABELS: Record<AccessFilterKey, string> = {
  open24h: '24h/24',
  litAtNight: 'Éclairé la nuit',
  covered: 'Couvert',
}

function inferAccessFromNote(note?: string): Partial<SpotAccess> {
  if (!note) return {}

  const lower = note.toLowerCase()

  return {
    open24h: /24\s*h|24\s*\/\s*24|24h\/24|accès libre/.test(lower),
    litAtNight: /éclair|lumière|lampe|nuit/.test(lower),
    covered: /couvert|abri|toit|sous le pont|indoor|intérieur/.test(lower),
  }
}

export function getSpotAccess(spot: Spot): Required<SpotAccess> {
  const inferred = inferAccessFromNote(spot.note)

  return {
    open24h: spot.access?.open24h ?? inferred.open24h ?? false,
    litAtNight: spot.access?.litAtNight ?? inferred.litAtNight ?? false,
    covered: spot.access?.covered ?? inferred.covered ?? false,
  }
}

export function spotMatchesAccess(spot: Spot, activeFilters: AccessFilterKey[]): boolean {
  if (activeFilters.length === 0) return true

  const access = getSpotAccess(spot)
  return activeFilters.every((key) => access[key])
}
