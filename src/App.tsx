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
import { FiltersPanel } from './components/FiltersPanel'
import { getEquipmentOptions } from './lib/equipment'
import type { AccessFilterKey } from './lib/access'
import { countMatchingSpots, filterSpots } from './lib/filterSpots'
import { loadUserRatings, saveUserRating, type UserRating } from './lib/ratings'

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
  const [isSpotSheetOpen, setIsSpotSheetOpen] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites())
  const [recenterSignal, setRecenterSignal] = useState(0)
  const [showProposeModal, setShowProposeModal] = useState(false)
  const { position } = useGeolocation()
  const { theme, toggleTheme } = useTheme()
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [appliedEquipment, setAppliedEquipment] = useState<string[]>([])
  const [accessFilters, setAccessFilters] = useState<AccessFilterKey[]>([])
  const [groundFilters, setGroundFilters] = useState<string[]>([])
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [userRatings, setUserRatings] = useState<Record<string, UserRating>>(() => loadUserRatings())

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

  const equipmentOptions = useMemo(() => getEquipmentOptions(spots), [spots])

  const equipmentMatchCount = useMemo(
  () => countMatchingSpots(spots, selectedEquipment, accessFilters, groundFilters, showOnlyFavorites, favorites),
  [accessFilters, selectedEquipment, spots, groundFilters, showOnlyFavorites, favorites],
)

  const filteredSpots = useMemo(() => {
    const base = filterSpots(spots, {
      query,
      arrondissement,
      appliedEquipment,
      accessFilters,
      groundFilters,
    })
    if (showOnlyFavorites) return base.filter((spot) => favorites.has(spot.id))
    return base
  }, [accessFilters, appliedEquipment, arrondissement, query, spots, groundFilters, showOnlyFavorites, favorites])

  const nearbySpots = useMemo(() => {
    return filteredSpots
      .filter((spot) => spot.lat !== undefined && spot.lng !== undefined)
      .map((spot) => ({
        spot,
        distance: getDistanceMeters(listCenter, { lat: spot.lat!, lng: spot.lng! }),
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

  const toggleEquipment = (equipmentName: string) => {
    setSelectedEquipment((current) => {
      if (current.includes(equipmentName)) {
        return current.filter((name) => name !== equipmentName)
      }
      return [...current, equipmentName]
    })
  }

  const toggleGroundFilter = (value: string) => {
    setGroundFilters((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    )
  }

  const applyEquipmentFilters = () => {
    setAppliedEquipment([...selectedEquipment])
  }

  const toggleAccessFilter = (key: AccessFilterKey) => {
    setAccessFilters((current) => {
      if (current.includes(key)) {
        return current.filter((entry) => entry !== key)
      }
      return [...current, key]
    })
  }

  const rateSpot = (spotId: string, value: UserRating) => {
    saveUserRating(spotId, value)
    setUserRatings((current) => ({ ...current, [spotId]: value }))
  }

  const handleSetMode = (newMode: Mode) => {
    setMode((current) => (current === newMode ? 'map' : newMode))
  }

  const handleSelectSpot = (spot: Spot) => {
    setSelectedSpot(spot)
    setIsSpotSheetOpen(true)
    setMode('map')
  }

  const handleSelectMapSpot = (spot: Spot) => {
  if (selectedSpot?.id === spot.id) {
    setSelectedSpot(null)
    setIsSpotSheetOpen(false)
  } else {
    setSelectedSpot(spot)
    setIsSpotSheetOpen(true)
  }
  setMode('map')
}

  const handleResetFilters = () => {
    setSelectedEquipment([])
    setAppliedEquipment([])
    setAccessFilters([])
    setGroundFilters([])
    setArrondissement('')
    setShowOnlyFavorites(false)
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
          onSelectSpot={handleSelectMapSpot}
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
            equipmentOptions={equipmentOptions}
            selectedEquipment={selectedEquipment}
            onToggleEquipment={toggleEquipment}
            onApplyEquipment={applyEquipmentFilters}
            equipmentMatchCount={equipmentMatchCount}
            accessFilters={accessFilters}
            onToggleAccessFilter={toggleAccessFilter}
            groundFilters={groundFilters}
            onToggleGroundFilter={toggleGroundFilter}
            onResetFilters={handleResetFilters}
            showOnlyFavorites={showOnlyFavorites}
            onToggleFavorites={() => setShowOnlyFavorites((v) => !v)}
          />
          <FiltersPanel
          arrondissement={arrondissement}
            onArrondissementChange={setArrondissement}
            options={arrondissementOptions}
            equipmentOptions={equipmentOptions}
            selectedEquipment={selectedEquipment}
            onToggleEquipment={toggleEquipment}
            onApplyEquipment={applyEquipmentFilters}
            equipmentMatchCount={equipmentMatchCount}
            accessFilters={accessFilters}
            onToggleAccessFilter={toggleAccessFilter}
            groundFilters={groundFilters}
            onToggleGroundFilter={toggleGroundFilter}
            onResetFilters={handleResetFilters}
            showOnlyFavorites={showOnlyFavorites}
            onToggleFavorites={() => setShowOnlyFavorites((v) => !v)}>
            </FiltersPanel>
        </div>

        {loadStatus === 'loading' ? (
          <div className="empty-state" role="status">
            Chargement des spots…
          </div>
        ) : null}

        {emptyMessage ? (
          <div className="empty-state" role="status">
            {emptyMessage}
          </div>
        ) : null}

        {mode === 'list' ? (
        <NearbyListView
          spots={filteredSpots}
          favoriteIds={favorites}
          onSelectSpot={handleSelectSpot}
        />
      ) : null}

        {mode === 'favorites' ? (
          <FavoritesView spots={spots} favoriteIds={favorites} onSelectSpot={handleSelectSpot} />
        ) : null}

        {isSpotSheetOpen && selectedSpot ? (
          <SpotSheet
            spot={selectedSpot}
            allSpots={spots}
            isFavorite={favorites.has(selectedSpot.id)}
            userPosition={position}
            userRatings={userRatings}
            onClose={() => {
              setIsSpotSheetOpen(false)
              setSelectedSpot(null)
            }}
            onToggleFavorite={toggleFavorite}
            onRateSpot={rateSpot}
            onSelectSpot={handleSelectSpot}
          />
        ) : null}

        {showProposeModal ? <ProposeSpotModal onClose={() => setShowProposeModal(false)} /> : null}
      </main>

      <BottomNav
        mode={mode}
        theme={theme}
        onSetMode={handleSetMode}
        onRecenter={() => setRecenterSignal((v) => v + 1)}
        onToggleTheme={toggleTheme}
      />
    </div>
  )
}

export default App