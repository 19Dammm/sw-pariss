import { useState, useEffect, useRef } from 'react'
import type { EquipmentOption } from '../lib/equipment'
import type { AccessFilterKey } from '../lib/access'
import { ACCESS_FILTER_LABELS } from '../lib/access'

const GROUND_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'béton', label: '🪨 Béton' },
  { value: 'tartan', label: '🔴 Tartan' },
  { value: 'gazon', label: '🌿 Gazon' },
  { value: 'sable', label: '🏖️ Sable' },
  { value: 'dalle', label: '⬜ Dalle' },
]

type FiltersBarProps = {
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
}

export function FiltersBar({
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
}: FiltersBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const totalActiveFilters =
    selectedEquipment.length + accessFilters.length + groundFilters.length

  const hasActiveFilters =
    totalActiveFilters > 0 || arrondissement !== ''

  const handleApply = () => {
    onApplyEquipment()
    setIsOpen(false)
  }

  const handleReset = () => {
    onResetFilters()
    setIsOpen(false)
  }

  // Ferme le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="filters-bar">
      {/* Arrondissement */}
      <label>
        <span>Arrondissement</span>
        <select
          value={arrondissement}
          onChange={(e) => onArrondissementChange(e.target.value)}
        >
          <option value="">Tous</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      {/* Dropdown filtres unifié */}
      <div className="equipment-filter" ref={menuRef}>
        <button
          type="button"
          className={`equipment-filter-trigger${totalActiveFilters > 0 ? ' equipment-filter-trigger--active' : ''}`}
          onClick={() => setIsOpen((v) => !v)}
        >
          Filtres{totalActiveFilters > 0 ? ` (${totalActiveFilters})` : ''}
        </button>

        {isOpen && (
          <div className="div-equipement">
            {/* Sol */}
            <h4>Sol</h4>
            <div className="filter-chips-row">
              {GROUND_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`filter-chip${groundFilters.includes(value) ? ' filter-chip--active' : ''}`}
                  onClick={() => onToggleGroundFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="filter-divider" />

            {/* Conditions */}
            <h4>Conditions</h4>
            <div className="filter-chips-row">
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

            <div className="filter-divider" />

            {/* Équipements */}
            <h4>Équipements</h4>
            {equipmentOptions.map((option) => (
              <label key={option.name} className="equipment-option">
                <input
                  type="checkbox"
                  checked={selectedEquipment.includes(option.name)}
                  onChange={() => onToggleEquipment(option.name)}
                />
                <span>
                  {option.name} ({option.count})
                </span>
              </label>
            ))}

            <div className="filter-divider" />

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
                Voir {equipmentMatchCount} spot{equipmentMatchCount !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}