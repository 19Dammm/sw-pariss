import { useEffect, useRef } from 'react'
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MAP_TILES } from '../lib/mapTiles'
import { createSpotIcon } from '../lib/spotMarkerIcon'
import type { Theme } from '../lib/theme'
import type { Spot } from '../types/spot'

type Position = {
  lat: number
  lng: number
}

type MapViewProps = {
  spots: Spot[]
  userPosition: Position | null
  selectedSpotId: string | null
  isSpotSheetOpen: boolean
  onSelectSpot: (spot: Spot) => void
  onOpenSpotSheet: (spot: Boolean) => void
  recenterSignal: number
  theme: Theme
}

function MapBounds({ spots }: { spots: Spot[] }) {
  const map = useMap()
  const previousKey = useRef('')

  useEffect(() => {
    if (spots.length === 0) return

    const key = spots.map((spot) => spot.id).join(',')
    if (key === previousKey.current) return
    previousKey.current = key

    const bounds = L.latLngBounds(
      spots
        .filter((s) => s.lat !== undefined && s.lng !== undefined)
        .map((s) => [s.lat!, s.lng!] as [number, number]),
    )
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15, animate: false })
  }, [map, spots])

  return null
}

function UserRecenter({
  userPosition,
  recenterSignal,
}: {
  userPosition: Position | null
  recenterSignal: number
}) {
  const map = useMap()

  useEffect(() => {
    if (!userPosition || recenterSignal === 0) return

    map.setView([userPosition.lat, userPosition.lng], Math.max(map.getZoom(), 15), {
      animate: true,
    })
  }, [map, userPosition, recenterSignal])

  return null
}

function SpotFlyTo({ spotId, spots }: { spotId: string | null; spots: Spot[] }) {
  const map = useMap()
  const previousSpotId = useRef<string | null>(null)

  useEffect(() => {
    if (!spotId) {
      previousSpotId.current = null
      return
    }

    if (spotId === previousSpotId.current) return

    const spot = spots.find((entry) => entry.id === spotId)
    if (!spot || spot.lat === undefined || spot.lng === undefined) return

    previousSpotId.current = spotId
    map.flyTo([spot.lat, spot.lng], 16, { animate: true, duration: 0.8 })
  }, [map, spotId, spots])

  return null
}

export function MapView({
  spots,
  userPosition,
  selectedSpotId,
  isSpotSheetOpen,
  onSelectSpot,
  onOpenSpotSheet,
  recenterSignal,
  theme,
}: MapViewProps) {
  const tiles = MAP_TILES[theme]
  const defaultCenter: [number, number] = [48.8865, 2.3849]

  return (
    <MapContainer center={defaultCenter} zoom={14} className="map">
      <TileLayer key={theme} attribution={tiles.attribution} url={tiles.url} />

      <MapBounds spots={spots} />
      <UserRecenter userPosition={userPosition} recenterSignal={recenterSignal} />
      <SpotFlyTo spotId={selectedSpotId} spots={spots} />

      {userPosition ? (
        <Circle
          center={[userPosition.lat, userPosition.lng]}
          radius={35}
          pathOptions={{ color: '#0a84ff', fillColor: '#0a84ff', fillOpacity: 0.6, weight: 1 }}
        />
      ) : null}

      {spots
        .filter((spot) => spot.lat !== undefined && spot.lng !== undefined)
        .map((spot) => {
          const isSelected = spot.id === selectedSpotId

          return (
            <Marker
              key={spot.id}
              position={[spot.lat!, spot.lng!]}
              icon={createSpotIcon(theme, isSelected)}
              eventHandlers={{ click: () => onSelectSpot(spot) }}
            >
              {isSelected && !isSpotSheetOpen ? (
                <Tooltip
                  permanent
                  direction="auto"
                  offset={[0, -44]}
                  className="spot-popup-tooltip"
                  eventHandlers={{
                    click: (event) => {
                      L.DomEvent.stopPropagation(event.originalEvent)
                      onOpenSpotSheet(true)
                    },
                  }}
                >
                  <div className="spot-popup-content">
                    <strong className="spot-popup-name">{spot.name}</strong>
                    <span className="spot-popup-arr">{spot.arrondissement}</span>
                    <p className="spot-popup-cta">Appuie pour voir plus →</p>
                  </div>
                </Tooltip>
              ) : null}
            </Marker>
          )
        })}
    </MapContainer>
  )
}
