import { useEffect, useRef, useState } from 'react'
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MAP_TILES } from '../lib/mapTiles'
import { createSpotIcon } from '../lib/spotMarkerIcon'
import type { Theme } from '../lib/theme'
import type { Spot } from '../types/spot'
import { getEquipmentIcon } from './SpotSheet'

type Position = {
  lat: number
  lng: number
}

type MapViewProps = {
  spots: Spot[]
  userPosition: Position | null
  selectedSpotId: string | null
  onSelectSpot: (spot: Spot) => void
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

  const hasRecentered = useRef(false)

    useEffect(() => {
      if (!userPosition || hasRecentered.current) return
      hasRecentered.current = true
      map.setView([userPosition.lat, userPosition.lng], 15, { animate: true })
    }, [map, userPosition])

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
  onSelectSpot,
  recenterSignal,
  theme,
}: MapViewProps) {
  const tiles = MAP_TILES[theme]
  const defaultCenter: [number, number] = [48.8865, 2.3849]
  const [hoveredSpotId, setHoveredSpotId] = useState<string | null>(null)
  const closeTooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const keepTooltipOpen = () => {
    if (closeTooltipTimer.current) {
      clearTimeout(closeTooltipTimer.current)
      closeTooltipTimer.current = null
    }
  }

  const showTooltip = (spotId: string) => {
    keepTooltipOpen()
    setHoveredSpotId(spotId)
  }

  const scheduleTooltipClose = () => {
    keepTooltipOpen()
    closeTooltipTimer.current = setTimeout(() => {
      setHoveredSpotId(null)
      closeTooltipTimer.current = null
    }, 150)
  }

  useEffect(
    () => () => {
      if (closeTooltipTimer.current) clearTimeout(closeTooltipTimer.current)
    },
    [],
  )

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
          const images = Array.isArray(spot.image) ? spot.image : spot.image ? [spot.image] : []
          return (
            <Marker
              key={spot.id}
              position={[spot.lat!, spot.lng!]}
              icon={createSpotIcon(theme, isSelected)}
              eventHandlers={{
                mouseover: () => showTooltip(spot.id),
                mouseout: scheduleTooltipClose,
                click: () => onSelectSpot(spot),
              }}
            >
              {hoveredSpotId === spot.id ? (
                <Tooltip
                  permanent
                  direction="auto"
                  offset={[0, -44]}
                  className="spot-popup-tooltip"
                >
                  {images.length > 0 ? (
                  <img
                    src={images[0]}
                    alt={spot.name}
                    className="spot-popup-image"
                  />
                ) : null}
                  <button
                    type="button"
                    className="spot-popup-content"
                    onMouseEnter={keepTooltipOpen}
                    onMouseLeave={scheduleTooltipClose}
                    onClick={(event) => {
                      event.stopPropagation()
                      onSelectSpot(spot)
                    }}
                  >
                    <strong className="spot-popup-name">{spot.name}</strong>
                    <span className="spot-popup-arr">{spot.arrondissement}</span>
                    <div className="equipment-badges">
              {spot.equipment.slice(0, 3).map((eq) => (
                <span key={eq} className="equipment-badge">
                  <span className="equipment-icon">{getEquipmentIcon(eq)}</span>
                  {eq}
                </span>
              ))}
              <button className='equipment-badge'> + </button>
            </div>
                    <p className="spot-popup-cta">Appuie pour voir plus</p>
                  </button>
                </Tooltip>
              ) : null}
            </Marker>
          )
        })}
    </MapContainer>
  )
}
// Onclick bottom nav, if le click was on current mode, currentMode = 'map'
//
//
//