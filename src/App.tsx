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
    () => countMatchingSpots(spots, selectedEquipment, accessFilters),
    [accessFilters, selectedEquipment, spots],
  )

  const filteredSpots = useMemo(
    () =>
      filterSpots(spots, {
        query,
        arrondissement,
        appliedEquipment,
        accessFilters,
      }),
    [accessFilters, appliedEquipment, arrondissement, query, spots],
  )

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

  const handleSelectSpot = (spot: Spot) => {
    setSelectedSpot(spot)
    setIsSpotSheetOpen(true)
    setMode('map')
  }

  const handleSelectMapSpot = (spot: Spot) => {
    setSelectedSpot(spot)
    setIsSpotSheetOpen(false)
    setMode('map')
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
          isSpotSheetOpen={isSpotSheetOpen}
          onSelectSpot={handleSelectMapSpot}
          onOpenSpotSheet={() => setIsSpotSheetOpen(true)}
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
          />
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
          <NearbyListView spots={nearbySpots} favoriteIds={favorites} onSelectSpot={handleSelectSpot} />
        ) : null}

        {mode === 'favorites' ? (
          <FavoritesView spots={spots} favoriteIds={favorites} onSelectSpot={handleSelectSpot} />
        ) : null}

        {isSpotSheetOpen ? (
          <SpotSheet
            spot={selectedSpot}
            allSpots={spots}
            isFavorite={selectedSpot ? favorites.has(selectedSpot.id) : false}
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
        onSetMode={setMode}
        onRecenter={() => setRecenterSignal((v) => v + 1)}
        onToggleTheme={toggleTheme}
      />
    </div>
  )
}

export default App
