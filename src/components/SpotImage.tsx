import type { Spot } from '../types/spot'

type SpotImageProps = {
  spot: Spot
}

export default function SpotImage({ spot }: SpotImageProps) {
  if (!spot.image) return null

  return <img 
  src={spot.image}
   alt={spot.name}
   onError={() => console.error('Image introuvable :', spot.image)} />
}