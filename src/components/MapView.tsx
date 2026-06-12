import { useEffect, useRef } from 'react'
import { Circle, MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
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

    const bounds = L.latLngBounds(spots.map((spot) => [spot.lat, spot.lng] as [number, number]))
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

  return (
    <MapContainer center={defaultCenter} zoom={14} className="map">
      <TileLayer key={theme} attribution={tiles.attribution} url={tiles.url} />

      <MapBounds spots={spots} />
      <UserRecenter userPosition={userPosition} recenterSignal={recenterSignal} />

      {userPosition ? (
        <Circle
          center={[userPosition.lat, userPosition.lng]}
          radius={35}
          pathOptions={{ color: '#0a84ff', fillColor: '#0a84ff', fillOpacity: 0.6, weight: 1 }}
        />
      ) : null}

      {spots.map((spot) => (
        <Marker
          key={spot.id}
          position={[spot.lat, spot.lng]}
          icon={createSpotIcon(theme, spot.id === selectedSpotId)}
          eventHandlers={{ click: () => onSelectSpot(spot) }}
        />
      ))}
    </MapContainer>
  )
}
