import type { Spot } from '../types/spot'
import { useEffect, useState } from 'react'
import { getSpotImages } from '../lib/spotImages'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function SpotImages({ spot }: { spot: Spot }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set())
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const images = getSpotImages(spot)

  useEffect(() => {
    setIsExpanded(false)
    setFailedImages(new Set())
  }, [spot.id])

  const availableImages = images.filter((image) => !failedImages.has(image))
  const displayedImages = isExpanded ? availableImages : availableImages.slice(0, 3)

  if (availableImages.length === 0) {
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
        {displayedImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt={`Photo ${index + 1} — ${spot.name}`}
            className="spot-sheet-image"
            onError={() =>
              setFailedImages((current) => {
                const next = new Set(current)
                next.add(image)
                return next
              })
            }
            onClick={() => {setLightboxIndex(0)}}
          />
        ))}
        {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={() => setLightboxIndex(null)}>
          <button className="lightbox-close" onClick={() => setLightboxIndex(null)}>✕</button>
          
          <button className="lightbox-prev" onClick={(e) => {
            e.stopPropagation()
            setLightboxIndex((i) => i! > 0 ? i! - 1 : availableImages.length - 1)
          }}><ChevronLeft size={32} /></button>
          <img
            src={availableImages[lightboxIndex]}
            alt={`Photo ${lightboxIndex + 1}`}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />

          <button className="lightbox-next" onClick={(e) => {
            e.stopPropagation()
            setLightboxIndex((i) => i! < availableImages.length - 1 ? i! + 1 : 0)
          }}><ChevronRight size={32} /></button>

          <span className="lightbox-counter">{lightboxIndex + 1} / {availableImages.length}</span>
        </div>
      )}
      </div>
      {availableImages.length > 3 ? (
        <button
          type="button"
          className="spot-sheet-images-footer"
          onClick={() => {
            setIsExpanded((current) => !current)
            setLightboxIndex(0)
          }}
        >
          {isExpanded ? 'Réduire les photos' : `Afficher ${availableImages.length - 3} photo${availableImages.length - 3 > 1 ? 's' : ''} de plus`}
        </button>
      ) : null}
    </div>
  )
}

export function SpotTooltip({ spot }: { spot: Spot }) {
  const [imageError, setImageError] = useState(false)
  const image = getSpotImages(spot)[0]

  return (
    <div className="spot-tooltip">
      {image && !imageError ? (
        <img
          src={image}
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
