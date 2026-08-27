import type { Spot } from '../types/spot'
import { useState } from 'react'

export default function SpotImages({ spot }: { spot: Spot }) {
  if (!spot.image) {
    return (
      <div className="spot-sheet-images">
        <div className="spot-sheet-images-scroll spot-sheet-images-empty">
          <span>Aucune photo</span>
        </div>
      </div>
    )
  }

  return (
    <div className="spot-sheet-images">
      <div className="spot-sheet-images-scroll">
        <img
          src={spot.image}
          alt={spot.name}
          className="spot-sheet-image"
          onError={() => console.error('Image introuvable :', spot.image)}
        />
      </div>
    </div>
  )
}

export function SpotTooltip({ spot }: { spot: Spot }) {
  const [imageError, setImageError] = useState(false)
  const hasImage = Boolean(spot.image && !imageError)

  return (
    <div className="spot-tooltip">
      {hasImage ? (
        <img
          src={spot.image}
          alt={spot.name}
          className="spot-tooltip-image"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="spot-tooltip-content">
          <strong>{spot.name}</strong>
          <span>{spot.address}</span>
        </div>
      )}
    </div>
  )
}
