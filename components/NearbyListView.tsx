import type { Spot } from '../types/spot'

type NearbyListViewProps = {
  spots: Spot[]
  favoriteIds: Set<string>
  onSelectSpot: (spot: Spot) => void
}

export function NearbyListView({ spots, favoriteIds, onSelectSpot }: NearbyListViewProps) {
  return (
    <section className="nearby-list">
      {spots.map((spot) => (
        <button key={spot.id} type="button" className="list-item" onClick={() => onSelectSpot(spot)}>
          <div>
            <strong>{spot.name}</strong>
            <p>{spot.address}</p>
          </div>
          <span aria-label={favoriteIds.has(spot.id) ? 'favori' : 'non favori'}>
            {favoriteIds.has(spot.id) ? '★' : '☆'}
          </span>
        </button>
      ))}
    </section>
  )
}

