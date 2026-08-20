import { useState, useEffect, useRef } from 'react'
import type { EquipmentOption } from '../lib/equipment'
import type { AccessFilterKey } from '../lib/access'
import { ACCESS_FILTER_LABELS } from '../lib/access'

const GROUND_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'béton', label: 'Béton' },
  { value: 'tartan', label: 'Tartan' },
  { value: 'gazon', label: 'Gazon' },
  { value: 'sable', label: 'Sable' },
  { value: 'dalle', label: 'Dalle' },
]

type FiltersPanelProps = {
  arrondissement: string
  onArrondissementChange: (value: string) => void
  options: string[]
  equipmentOptions: EquipmentOption[]
  selectedEquipment: string[]
  onToggleEquipment: (equipmentName: string) => void
  onApplyEquipment: () => void
  equipmentMatchCount: number
  accessFilters: AccessFilterKey[]
  onToggleAccessFilter: (key: AccessFilterKey) => void
  groundFilters: string[]
  onToggleGroundFilter: (value: string) => void
  onResetFilters: () => void
  showOnlyFavorites: boolean
  onToggleFavorites: () => void
}

export function FiltersPanel({
  arrondissement,
  equipmentOptions,
  selectedEquipment,
  onToggleEquipment,
  onApplyEquipment,
  equipmentMatchCount,
  accessFilters,
  onToggleAccessFilter,
  groundFilters,
  onToggleGroundFilter,
  onResetFilters,
  showOnlyFavorites,
  onToggleFavorites,
}: FiltersPanelProps) {
  const [showPanel, setShowPanel] = useState(false)
  const [showAllEquipment, setShowAllEquipment] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const totalActiveFilters =
    selectedEquipment.length + accessFilters.length + groundFilters.length

  const hasActiveFilters =
    totalActiveFilters > 0 || arrondissement !== '' || showOnlyFavorites

  const handleApply = () => {
    onApplyEquipment()
    setShowPanel(false)
  }

  const handleReset = () => {
    onResetFilters()
    setShowPanel(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowPanel(false)
      }
    }
    if (showPanel) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPanel])

  return (
    <div className="filters-panel-wrapper" ref={menuRef}>
      <button
        type="button"
        className={`filters-toggle-button${hasActiveFilters ? ' filters-toggle-button--active' : ''}`}
        onClick={() => setShowPanel((v) => !v)}
        aria-expanded={showPanel}
      >
        Filtres{totalActiveFilters > 0 ? ` (${totalActiveFilters})` : ''}
      </button>

      {showPanel && (
        <div className="filters-panel">

          {/* Favoris */}
          <div className="filter-category">
            <h3>Favoris</h3>
            <div className="filter-options-row">
              <button
                type="button"
                className={`filter-chip${showOnlyFavorites ? ' filter-chip--active' : ''}`}
                onClick={onToggleFavorites}
              >
                Mes favoris
              </button>
            </div>
          </div>

          {/* Equipement */}
          <div className="filter-category">
            <h3>Equipement</h3>
            <div className="filter-options-row">
              {equipmentOptions
                .slice(0, showAllEquipment ? equipmentOptions.length : 4)
                .map((equipment) => (
                  <button
                    key={equipment.name}
                    type="button"
                    className={`filter-chip${selectedEquipment.includes(equipment.name) ? ' filter-chip--active' : ''}`}
                    onClick={() => onToggleEquipment(equipment.name)}
                  >
                    {equipment.name}
                  </button>
                ))}

              {equipmentOptions.length > 4 && (
                <button
                  type="button"
                  className="filter-see-more"
                  onClick={() => setShowAllEquipment((v) => !v)}
                >
                  {showAllEquipment ? 'Voir moins' : 'Voir plus'}
                </button>
              )}
            </div>
          </div>

          {/* Sol */}
          <div className="filter-category">
            <h3>Sol</h3>
            <div className="filter-options-row">
              {GROUND_OPTIONS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  className={`filter-chip${groundFilters.includes(g.value) ? ' filter-chip--active' : ''}`}
                  onClick={() => onToggleGroundFilter(g.value)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div className="filter-category">
            <h3>Conditions</h3>
            <div className="filter-options-row">
              {(Object.keys(ACCESS_FILTER_LABELS) as AccessFilterKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`filter-chip${accessFilters.includes(key) ? ' filter-chip--active' : ''}`}
                  onClick={() => onToggleAccessFilter(key)}
                >
                  {ACCESS_FILTER_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="filter-actions">
            {hasActiveFilters && (
              <button
                type="button"
                className="filter-reset-button"
                onClick={handleReset}
              >
                Reinitialiser
              </button>
            )}
            <button
              type="button"
              className="equipment-search-button"
              onClick={handleApply}
            >
              Voir {equipmentMatchCount} spot{equipmentMatchCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}