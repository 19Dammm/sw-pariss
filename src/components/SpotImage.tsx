import type { Spot } from '../types/spot'


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