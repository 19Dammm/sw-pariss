import { useEffect, useRef, useState } from 'react'
import { Circle, MapContainer, Marker, Tooltip, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MAP_TILES } from '../lib/mapTiles'
import { createSpotIcon } from '../lib/spotMarkerIcon'
import type { Theme } from '../lib/theme'
import type { Spot } from '../types/spot'

const EQUIPMENT_ICONS: Record<string, string> = {
  traction: '', suspension: '', échelle: '',
  parallèles: '', dips: '',
  abdos: '', banc: '',
  pompe: '',
  pont: '', module: '', parkour: '',
  escalade: '', mur: '',
  fitness: '', cross: '',
  poids: '',
  anneau: '',
  singe: '',
}

function getEquipmentIcon(name: string): string {
  const lower = name.toLowerCase()
  for (const [kw, icon] of Object.entries(EQUIPMENT_ICONS)) {
    if (lower.includes(kw)) return icon
  }
  return ''
}

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
type ViewMode = "map" | "tooltip" | "spotsheet";

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
  onSelectSpot,
  recenterSignal,
  theme,
}: MapViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
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
        .filter((spot, viewMode) => spot.lat !== undefined && spot.lng !== undefined)
        .map((spot) => {
          const isSelected = spot.id === selectedSpotId
          const previewEquipment = spot.equipment.slice(0, 3)
          const hasMore = spot.equipment.length > 3

          return (
           <Marker
  key={`${spot.id}-${isSelected ? 'selected' : 'idle'}`}
  position={[spot.lat!, spot.lng!]}
  icon={createSpotIcon(theme, isSelected)}
  eventHandlers={{
    click: () => {
      onSelectSpot(spot)
      setViewMode("tooltip")
    },
  }}
>
  {isSelected && viewMode === "tooltip" && (
    <Tooltip
      permanent
      direction="auto"
      offset={[0, -44]}
      className="spot-popup-tooltip"
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e.originalEvent)
          setViewMode("spotsheet")
        },
      }}
    >
      <div className="spot-popup-content">
        <div className="spot-popup-header">
          <strong className="spot-popup-name">
            {spot.name}
          </strong>

          <span className="spot-popup-arr">
            {spot.arrondissement}
          </span>
        </div>

        <div className="spot-popup-equipment">
          {previewEquipment.map((eq) => (
            <span key={eq} className="spot-popup-chip">
              {getEquipmentIcon(eq)} {eq}
            </span>
          ))}

          {hasMore && (
            <span className="spot-popup-chip spot-popup-chip--more">
              +{spot.equipment.length - 3}
            </span>
          )}
        </div>

        <p className="spot-popup-cta">
          Appuie pour voir plus →
        </p>
      </div>
    </Tooltip>
  )}
</Marker>
          )
        })}
    </MapContainer>
  )
}