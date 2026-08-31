import type { Spot } from '../types/spot'
import { getEquipmentIcon } from './SpotSheet'

type FavoritesViewProps = {
  spots: Spot[]
  favoriteIds: Set<string>
  onSelectSpot: (spot: Spot) => void
}

export function FavoritesView({ spots, favoriteIds, onSelectSpot }: FavoritesViewProps) {
  const favoriteSpots = spots.filter((spot) => favoriteIds.has(spot.id))

  return (
    <div className="panel-view">
      <p className="panel-view-title">Mes favoris</p>
      {favoriteSpots.length === 0 ? (
        <p className="panel-view-empty">
          Aucun favori pour l'instant.<br />Appuie sur ☆ dans la fiche d'un spot.
        </p>
      ) : (
        <ul className="nearby-list">
          {favoriteSpots.map((spot) => {
            const images = Array.isArray(spot.image)
              ? spot.image
              : spot.image
              ? [spot.image]
              : []

            return (
              <li key={spot.id}>
                <h3
                  className="nearby-item"
                  onClick={() => onSelectSpot(spot)}
                >
                  <div className="favorite-spot-image-container">
                    {images.length > 0 ? (
                      <img
                        src={images[0]}
                        alt={spot.name}
                        className="favorite-spot-image"
                      />
                    ) : (
                      <div className="favorite-spot-image-placeholder">
                        Photo pas encore disponible
                      </div>
                    )}
                  </div>

                  <strong className="spot-popup-name">{spot.name}</strong>
                  <span className="spot-popup-arr">{spot.arrondissement}</span>

                  <div className="equipment-badges">
                    {spot.equipment.slice(0, 3).map((eq) => (
                      <span key={eq} className="equipment-badge">
                        <span className="equipment-icon">{getEquipmentIcon(eq)}</span>
                        {eq}
                      </span>
                    ))}
                    {spot.equipment.length > 3 && (
                      <span className="equipment-badge">+{spot.equipment.length - 3}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="spot-popup-content-favorite"
                    onClick={(event) => {
                      event.stopPropagation()
                      onSelectSpot(spot)
                    }}
                  >
                    Afficher sur la carte
                  </button>
                </h3>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}