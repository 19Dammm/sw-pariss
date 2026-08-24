import { useMemo } from 'react'
import { getDistanceMeters } from '../lib/distance'
import SpotImage from './SpotImage'
import { buildMapsUrl } from '../lib/openInMaps'
import { formatRatingAverage, getEffectiveRating, type UserRating } from '../lib/ratings'
import {
  formatSimilarDistance,
  getSimilarSpots,
  getSimilarSpotsTitle,
  type SimilarSpot,
} from '../lib/similarSpots'
import type { Spot } from '../types/spot'

type SpotSheetProps = {
  spot: Spot | null
  allSpots: Spot[]
  isFavorite: boolean
  userPosition: { lat: number; lng: number } | null
  userRatings: Record<string, UserRating>
  onClose: () => void
  onToggleFavorite: (spotId: string) => void
  onRateSpot: (spotId: string, value: UserRating) => void
  onSelectSpot: (spot: Spot) => void
}

const EQUIPMENT_ICONS: Array<{ keywords: string[]; icon: string }> = [
  { keywords: ['traction', 'suspension', 'echelle'], icon: '' },
  { keywords: ['paralleles', 'dips'], icon: '' },
  { keywords: ['anneau'], icon: '' },
  { keywords: ['abdos', 'banc'], icon: '' },
  { keywords: ['pompe', 'barre a'], icon: '' },
  { keywords: ['parkour', 'pont', 'module', 'box', 'plateforme'], icon: '' },
  { keywords: ['escalade', 'mur'], icon: '' },
  { keywords: ['cross', 'parcours', 'fitness'], icon: '' },
  { keywords: ['boxe', 'frappe', 'sac'], icon: '' },
  { keywords: ['poids'], icon: '' },
  { keywords: ['pneu'], icon: '' },
  { keywords: ['piste', 'athletisme'], icon: '' },
  { keywords: ['fontaine'], icon: '' },
  { keywords: ['pmr', 'accessible'], icon: '' },
]

function getEquipmentIcon(name: string): string {
  const lower = name.toLowerCase()
  for (const { keywords, icon } of EQUIPMENT_ICONS) {
    if (keywords.some((kw) => lower.includes(kw))) return icon
  }
  return ''
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function renderStars(average: number) {
  const rounded = Math.round(average)
  return Array.from({ length: 5 }, (_, index) => (
    <span key={index} className={`rating-star${index < rounded ? ' rating-star--filled' : ''}`}>
      ★
    </span>
  ))
}

const PARIS_CENTER = { lat: 48.8566, lng: 2.3522 }



export function SpotSheet({
  spot,
  allSpots,
  isFavorite,
  userPosition,
  userRatings,
  onClose,
  onToggleFavorite,
  onRateSpot,
  onSelectSpot,
}: SpotSheetProps) {
  const similarSpots = useMemo(
    () => (spot ? getSimilarSpots(spot, allSpots) : []),
    [allSpots, spot],
  )

  if (!spot) return null

  const origin = userPosition ?? PARIS_CENTER
  const distanceMeters =
    spot.lat !== undefined && spot.lng !== undefined
      ? getDistanceMeters(origin, { lat: spot.lat, lng: spot.lng })
      : null
  const hasRealPosition = userPosition !== null
  const rating = getEffectiveRating(spot, userRatings)

  return (
    <aside className="spot-sheet">

      {/* Colonne gauche — images */}
      <SpotImage spot={spot} />

      {/* Colonne droite — details */}
      <div className="spot-sheet-body">

        {/* Header sticky */}
        <div className="spot-sheet-header">
          <div className="sheet-title-row">
            <strong className="sheet-name">{spot.name}</strong>
            <button type="button" className="sheet-close" onClick={onClose} aria-label="Fermer">
              ✕
            </button>
          </div>
          <div className="sheet-meta">
            <span className="sheet-chip sheet-chip--arr">{spot.arrondissement}</span>
            {distanceMeters !== null && (
              <span className="sheet-chip sheet-chip--dist">
                {hasRealPosition ? '' : ''} {formatDistance(distanceMeters)}
                {!hasRealPosition ? ' du centre' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="spot-sheet-content">
          <p className="sheet-address">{spot.address}</p>

          {spot.isVerified === false && (
            <div className="badge-unverified">Emplacement a verifier</div>
          )}

          {/* Note rapide */}
          <div className="sheet-section">
            <p className="sheet-section-label">Note rapide</p>
            <div className="rating-block">
              <div className="rating-summary">
                <span className="rating-stars">{renderStars(rating.average)}</span>
                <span className="rating-average">
                  {formatRatingAverage(rating.average)}
                  {rating.count > 0 ? ` (${rating.count})` : ''}
                </span>
              </div>
              <div className="rating-actions">
              
                <div className="rating-stars-input">
                  {([1, 2, 3, 4, 5] as UserRating[]).map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`rating-star-btn${rating.userRating === value ? ' rating-star-btn--active' : ''}`}
                      onClick={() => onRateSpot(spot.id, value)}
                      aria-label={`Noter ${value} sur 5`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Equipements */}
          <div className="sheet-section">
            <p className="sheet-section-label">Equipements</p>
            <div className="equipment-badges">
              {spot.equipment.map((eq) => (
                <span key={eq} className="equipment-badge">
                  <span className="equipment-icon">{getEquipmentIcon(eq)}</span>
                  {eq}
                </span>
              ))}
            </div>
          </div>

          {/* Note */}
          {spot.note ? (
            <div className="spot-note">
              <span className="spot-note-label">Note</span>
              <p>{spot.note}</p>
            </div>
          ) : null}

          {/* Spots similaires */}
          {similarSpots.length > 0 ? (
            <SimilarSpotsSection entries={similarSpots} onSelectSpot={onSelectSpot} />
          ) : null}

          {/* Actions */}
          <div className="sheet-actions">
            <button
              type="button"
              className={`sheet-btn-fav${isFavorite ? ' sheet-btn-fav--active' : ''}`}
              onClick={() => onToggleFavorite(spot.id)}
            >
              {isFavorite ? 'Favori' : 'Ajouter aux favoris'}
            </button>
          </div>

          {/* Navigation */}
          <div className="sheet-nav-links">
            <a
              href={buildMapsUrl('google', spot)}
              target="_blank"
              rel="noreferrer"
              className="sheet-nav-link"
            >
              Google Maps
            </a>
            <a
              href={buildMapsUrl('apple', spot)}
              target="_blank"
              rel="noreferrer"
              className="sheet-nav-link"
            >
              Apple Plans
            </a>
            <a
              href={buildMapsUrl('waze', spot)}
              target="_blank"
              rel="noreferrer"
              className="sheet-nav-link sheet-nav-link--waze"
            >
              Waze
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}

function SimilarSpotsSection({
  entries,
  onSelectSpot,
}: {
  entries: SimilarSpot[]
  onSelectSpot: (spot: Spot) => void
}) {
  return (
    <div className="sheet-section similar-spots">
      <p className="sheet-section-label">{getSimilarSpotsTitle(entries)}</p>
      <div className="similar-spots-list">
        {entries.map(({ spot, distance, sharedEquipment }) => (
          <button
            key={spot.id}
            type="button"
            className="similar-spot-item"
            onClick={() => onSelectSpot(spot)}
          >
            <div>
              <strong>{spot.name}</strong>
              <p>{sharedEquipment.join(', ')}</p>
            </div>
            <span>{formatSimilarDistance(distance)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}