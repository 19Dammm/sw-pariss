// ...existing code...
import { useState, useEffect, useRef } from 'react'
import type { EquipmentOption } from '../lib/equipment'
import type { AccessFilterKey } from '../lib/access'
import { ACCESS_FILTER_LABELS } from '../lib/access'

const GROUND_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'béton', label: ' Béton' },
  { value: 'tartan', label: ' Tartan' },
  { value: 'gazon', label: ' Gazon' },
  { value: 'sable', label: 'Sable' },
  { value: 'dalle', label: ' Dalle' },
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
  onArrondissementChange,
  options,
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
  // ...existing code...
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
    <div className="filters-panel-wrapper">
      {/* Toggle button that shows/hides the panel */}
      <button
        type="button"
        className="filters-toggle-button"
        onClick={() => setShowPanel((v) => !v)}
        aria-expanded={showPanel}
      >
        {showPanel ? 'Masquer le panneau' : 'Afficher le panneau'}
      </button>

      {/* Panel (visible only when showPanel is true) */}
      {showPanel && (
        <div className="filters-panel" ref={menuRef}>
          <div className="filter-category">
            <h3>Favoris</h3>
            <div className="filter-options-row">
              <button type="button" onClick={onToggleFavorites}>
                ★ Mes favoris
              </button>
            </div>
          </div>

          <div className="filter-category">
            <h3>Équipement</h3>
            <div className="filter-options-row">
              {equipmentOptions
                .slice(0, showAllEquipment ? equipmentOptions.length : 2)
                .map((equipment) => (
                  <button
                    key={equipment.name}
                    type="button"
                    onClick={() => onToggleEquipment(equipment.name)}
                    aria-pressed={selectedEquipment.includes(equipment.name)}
                  >
                    {equipment.name}
                  </button>
                ))}

              {equipmentOptions.length > 2 && (
                <button
                  type="button"
                  onClick={() => setShowAllEquipment((v) => !v)}
                >
                  {showAllEquipment ? 'Voir moins' : 'Voir plus'}
                </button>
              )}
            </div>
          </div>

          <div className="filter-category">
            <h3>Sol</h3>
            <div className="filter-options-row">
              {GROUND_OPTIONS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => onToggleGroundFilter(g.value)}
                  aria-pressed={groundFilters.includes(g.value)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-category">
            <h3>Conditions</h3>
            <div className="filter-options-row">
              {(['Couvert', 'Éclairé', '24/24'] as const).map((c) => (
                <button key={c} type="button">
                  {c}
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
                Réinitialiser
              </button>
            )}
            <button
              type="button"
              className="equipment-search-button"
              onClick={handleApply}
            >
              Voir {equipmentMatchCount} spot
              {equipmentMatchCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
// ...existing code...