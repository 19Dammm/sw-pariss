import { getDistanceMeters } from '../lib/distance'
import { buildMapsUrl } from '../lib/openInMaps'
import type { Spot } from '../types/spot'

type SpotSheetProps = {
  spot: Spot | null
  isFavorite: boolean
  userPosition: { lat: number; lng: number } | null
  onClose: () => void
  onToggleFavorite: (spotId: string) => void
}

const EQUIPMENT_ICONS: Array<{ keywords: string[]; icon: string }> = [
  { keywords: ['traction', 'suspension', 'échelle'], icon: '🏋️' },
  { keywords: ['parallèles', 'dips'], icon: '💪' },
  { keywords: ['anneau'], icon: '⭕' },
  { keywords: ['abdos', 'banc'], icon: '🪑' },
  { keywords: ['pompe', 'barre à'], icon: '↕️' },
  { keywords: ['parkour', 'pont', 'module', 'box', 'plateforme'], icon: '🏃' },
  { keywords: ['escalade', 'mur'], icon: '🧗' },
  { keywords: ['cross', 'parcours', 'fitness'], icon: '🔄' },
  { keywords: ['boxe', 'frappe', 'sac'], icon: '🥊' },
  { keywords: ['poids'], icon: '🏋️' },
  { keywords: ['pneu'], icon: '🔵' },
  { keywords: ['piste', 'athlétisme'], icon: '🏅' },
  { keywords: ['fontaine'], icon: '💧' },
  { keywords: ['pmr', 'accessible'], icon: '♿' },
  { keywords: ['roof', 'espalier'], icon: '📐' },
]

function getEquipmentIcon(name: string): string {
  const lower = name.toLowerCase()
  for (const { keywords, icon } of EQUIPMENT_ICONS) {
    if (keywords.some((kw) => lower.includes(kw))) return icon
  }
  return '⚙️'
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

const PARIS_CENTER = { lat: 48.8566, lng: 2.3522 }

export function SpotSheet({ spot, isFavorite, userPosition, onClose, onToggleFavorite }: SpotSheetProps) {
  if (!spot) return null

  const origin = userPosition ?? PARIS_CENTER
  const distanceMeters = getDistanceMeters(origin, { lat: spot.lat, lng: spot.lng })
  const hasRealPosition = userPosition !== null

  return (
    <aside className="spot-sheet">
      <div className="sheet-header">
        <div className="sheet-title-row">
          <strong className="sheet-name">{spot.name}</strong>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>
        <div className="sheet-meta">
          <span className="sheet-chip sheet-chip--arr">{spot.arrondissement}</span>
          <span className="sheet-chip sheet-chip--dist">
            {hasRealPosition ? '📍' : '🗺️'} {formatDistance(distanceMeters)}
            {!hasRealPosition && <span className="sheet-chip-sub"> du centre</span>}
          </span>
        </div>
      </div>

      <p className="sheet-address">{spot.address}</p>

      <div className="sheet-section">
        <p className="sheet-section-label">Équipements</p>
        <div className="equipment-badges">
          {spot.equipment.map((eq) => (
            <span key={eq} className="equipment-badge">
              <span className="equipment-icon">{getEquipmentIcon(eq)}</span>
              {eq}
            </span>
          ))}
        </div>
      </div>

      {spot.note ? (
        <div className="spot-note">
          <span className="spot-note-label">ℹ️ Note</span>
          <p>{spot.note}</p>
        </div>
      ) : null}

      <div className="sheet-actions">
        <button
          type="button"
          className={`sheet-btn-fav${isFavorite ? ' sheet-btn-fav--active' : ''}`}
          onClick={() => onToggleFavorite(spot.id)}
        >
          {isFavorite ? '★ Favori' : '☆ Ajouter aux favoris'}
        </button>
      </div>

      <div className="sheet-nav-links">
        <a href={buildMapsUrl('google', spot)} target="_blank" rel="noreferrer" className="sheet-nav-link">
          Google Maps
        </a>
        <a href={buildMapsUrl('apple', spot)} target="_blank" rel="noreferrer" className="sheet-nav-link">
          Apple Plans
        </a>
        <a href={buildMapsUrl('waze', spot)} target="_blank" rel="noreferrer" className="sheet-nav-link sheet-nav-link--waze">
          Waze
        </a>
      </div>
    </aside>
  )
}