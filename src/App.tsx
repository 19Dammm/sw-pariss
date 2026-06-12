import { useEffect, useMemo, useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { FavoritesView } from './components/FavoritesView'
import { FiltersBar } from './components/FiltersBar'
import { Header } from './components/Header'
import { MapView } from './components/MapView'
import { NearbyListView } from './components/NearbyListView'
import { ProposeSpotModal } from './components/ProposeSpotModal'
import { SearchBar } from './components/SearchBar'
import { SpotSheet } from './components/SpotSheet'
import { useGeolocation } from './hooks/useGeolocation'
import { useTheme } from './hooks/useTheme'
import { getDistanceMeters } from './lib/distance'
import { loadFavorites, saveFavorites } from './lib/favorites'
import type { Spot } from './types/spot'

const PARIS_19_CENTER = { lat: 48.8865, lng: 2.3849 }
const NEARBY_RADIUS_METERS = 2000

type LoadStatus = 'loading' | 'ready' | 'error'
type Mode = 'map' | 'list' | 'favorites'

function App() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading')
  const [query, setQuery] = useState('')
  const [arrondissement, setArrondissement] = useState('')
  const [mode, setMode] = useState<Mode>('map')
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites())
  const [recenterSignal, setRecenterSignal] = useState(0)
  const [showProposeModal, setShowProposeModal] = useState(false)
  const { position } = useGeolocation()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const load = async () => {
      setLoadStatus('loading')
      const response = await fetch(`${import.meta.env.BASE_URL}data/spots.19e.json`)
      if (!response.ok) throw new Error('Failed to load spots')
      const data = (await response.json()) as Spot[]
      setSpots(data)
      setLoadStatus('ready')
    }

    load().catch(() => {
      setSpots([])
      setLoadStatus('error')
    })
  }, [])

  const listCenter = position ?? PARIS_19_CENTER

  const arrondissementOptions = useMemo(
    () =>
      [...new Set(spots.map((spot) => spot.arrondissement))].sort((a, b) => {
        const num = (s: string) => parseInt(s)
        return num(a) - num(b)
      }),
    [spots],
  )

  const filteredSpots = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return spots.filter((spot) => {
      const arrondissementMatch = !arrondissement || spot.arrondissement === arrondissement
      const queryMatch =
        !normalizedQuery ||
        spot.name.toLowerCase().includes(normalizedQuery) ||
        spot.address.toLowerCase().includes(normalizedQuery) ||
        (spot.note?.toLowerCase().includes(normalizedQuery) ?? false)
      return arrondissementMatch && queryMatch
    })
  }, [arrondissement, query, spots])

  const nearbySpots = useMemo(() => {
    return filteredSpots
      .map((spot) => ({
        spot,
        distance: getDistanceMeters(listCenter, { lat: spot.lat, lng: spot.lng }),
      }))
      .filter((entry) => entry.distance <= NEARBY_RADIUS_METERS)
      .sort((a, b) => a.distance - b.distance)
      .map((entry) => entry.spot)
  }, [listCenter, filteredSpots])

  const toggleFavorite = (spotId: string) => {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(spotId)) {
        next.delete(spotId)
      } else {
        next.add(spotId)
      }
      saveFavorites(next)
      return next
    })
  }

  const emptyMessage =
    loadStatus === 'error'
      ? 'Impossible de charger les spots. Réessaie plus tard.'
      : loadStatus === 'ready' && spots.length === 0
        ? 'Aucun spot disponible pour le moment.'
        : loadStatus === 'ready' && filteredSpots.length === 0
          ? 'Aucun spot ne correspond à ta recherche.'
          : null

  return (
    <div className="app-shell">
      <Header onProposeSpot={() => setShowProposeModal(true)} />

      <main className="map-area">
        <MapView
          spots={filteredSpots}
          userPosition={position}
          selectedSpotId={selectedSpot?.id ?? null}
          onSelectSpot={setSelectedSpot}
          recenterSignal={recenterSignal}
          theme={theme}
        />

        <div className="overlay-top">
          <SearchBar
            value={query}
            onChange={setQuery}
            isListMode={mode === 'list'}
            onToggleMode={() => setMode((current) => (current === 'map' ? 'list' : 'map'))}
          />
          <FiltersBar
            arrondissement={arrondissement}
            onArrondissementChange={setArrondissement}
            options={arrondissementOptions}
          />
        </div>

        {loadStatus === 'loading' ? (
          <div className="empty-state" role="status">Chargement des spots…</div>
        ) : null}

        {emptyMessage ? (
          <div className="empty-state" role="status">{emptyMessage}</div>
        ) : null}

        {mode === 'list' ? (
          <NearbyListView spots={nearbySpots} favoriteIds={favorites} onSelectSpot={setSelectedSpot} />
        ) : null}

        {mode === 'favorites' ? (
          <FavoritesView spots={spots} favoriteIds={favorites} onSelectSpot={setSelectedSpot} />
        ) : null}

        <SpotSheet
          spot={selectedSpot}
          isFavorite={selectedSpot ? favorites.has(selectedSpot.id) : false}
          userPosition={position}
          onClose={() => setSelectedSpot(null)}
          onToggleFavorite={toggleFavorite}
        />

        {showProposeModal ? (
          <ProposeSpotModal onClose={() => setShowProposeModal(false)} />
        ) : null}
      </main>

      <BottomNav
        mode={mode}
        theme={theme}
        onSetMode={setMode}
        onRecenter={() => setRecenterSignal((v) => v + 1)}
        onToggleTheme={toggleTheme}
      />
    </div>
  )
}

export default App