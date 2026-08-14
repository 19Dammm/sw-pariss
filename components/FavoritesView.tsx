import type { Spot } from '../types/spot'

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
        <p className="panel-view-empty">Aucun favori pour l'instant.<br />Appuie sur ☆ dans la fiche d'un spot.</p>
      ) : (
        <ul className="nearby-list">
          {favoriteSpots.map((spot) => (
            <li key={spot.id}>
              <button
                type="button"
                className="nearby-item"
                onClick={() => onSelectSpot(spot)}
              >
                <div className="nearby-item-main">
                  <span className="nearby-item-name">{spot.name}</span>
                  <span className="nearby-item-arr">{spot.arrondissement}</span>
                </div>
                <span className="nearby-item-dist">⭐</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}