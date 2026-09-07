import type { Spot } from '../types/spot'

/**
 * Converts the JSON image field into usable public URLs.
 * Local files must go through Vite's base URL so they also work on GitHub Pages.
 */
export function getSpotImages(spot: Pick<Spot, 'image'>): string[] {
  const rawImages = Array.isArray(spot.image) ? spot.image : spot.image ? [spot.image] : []

  return rawImages
    .filter((image): image is string => typeof image === 'string' && image.trim().length > 0)
    .map((image) => resolveImageUrl(image))
}

function resolveImageUrl(image: string): string {
  if (/^(?:https?:)?\/\//i.test(image) || image.startsWith('data:')) return image

  return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, '')}`
}
