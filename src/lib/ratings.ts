import type { Spot, SpotRating } from '../types/spot'

const RATINGS_KEY = 'sw-paris:ratings:v1'

export type UserRating = 1 | 2 | 3 | 4 | 5

export function loadUserRatings(): Record<string, UserRating> {
  try {
    const raw = localStorage.getItem(RATINGS_KEY)
    if (!raw) return {}

    const values = JSON.parse(raw) as Record<string, number>
    if (!values || typeof values !== 'object') return {}

    const ratings: Record<string, UserRating> = {}
    for (const [spotId, value] of Object.entries(values)) {
      if (value >= 1 && value <= 5) {
        ratings[spotId] = value as UserRating
      }
    }

    return ratings
  } catch {
    return {}
  }
}

export function saveUserRating(spotId: string, value: UserRating) {
  const current = loadUserRatings()
  current[spotId] = value
  localStorage.setItem(RATINGS_KEY, JSON.stringify(current))
}

export function getEffectiveRating(
  spot: Spot,
  userRatings: Record<string, UserRating>,
): SpotRating & { userRating?: UserRating } {
  const base = spot.rating ?? { average: 0, count: 0 }
  const userRating = userRatings[spot.id]

  if (!userRating) {
    return { ...base, userRating: undefined }
  }

  const total = base.average * base.count + userRating
  const count = base.count + 1

  return {
    average: count > 0 ? total / count : userRating,
    count,
    userRating,
  }
}

export function formatRatingAverage(average: number): string {
  if (average === 0) return '—'
  return average.toFixed(1)
}
