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

export type FiltersPanelProps = {
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
  options,
  selectedEquipment,
  onArrondissementChange,
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
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  const totalActiveFilters =
    selectedEquipment.length + accessFilters.length + groundFilters.length

  const hasActiveFilters =
    totalActiveFilters > 0 || arrondissement !== '' || showOnlyFavorites

  const handleApply = () => {
    onApplyEquipment()
    setShowPanel(false)
  }
  const toggleCategory = (category: string) => {
  setOpenCategory((current) => current === category ? null : category)
}

  const handleReset = () => {
    onResetFilters()
    setShowPanel(false)
  }
  const EQUIPMENT_CATEGORIES = {
  'Barres': ['Barres de traction', 'Barres parallèles', 'Barres à dips', 'Barre à pompe', 'Barres de suspension', 'Échelle horizontale', 'Prise neutres'],
  'Suspension / Aérien': ['Anneaux', 'Pont de singe', 'Espalier'],
  'Fitness / Machines': ['Modules fitness', 'Modules cross-training', 'Poids', 'Machine Leg Press', 'Machine Pec Fly', 'Machine Shoulder Press', 'Tirage pour le dos', 'Box / plateforme squat'],
  'Combat / Fonctionnel': ['Sac de frappe', 'Pneu fonctionnel', 'Mur d\'escalade'],
  'Utilitaires': ['Fontaine', 'Banc abdos', 'Accessible PMR'],
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
      <button
        type="button"
        className={`equipment-filter-trigger${hasActiveFilters ? ' equipment-filter-trigger' : ''}`}
        onClick={() => setShowPanel((v) => !v)}
        aria-expanded={showPanel}
      >
        Filtres{totalActiveFilters > 0 ? ` (${totalActiveFilters})` : ''}
      </button>

      {showPanel && (
        <div className="filters-panel">

          {/* Favoris */}
          <div className="filter-category">
            <h3 className='h3-panel'>Favoris</h3>
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
            <h3 className='h3-panel'>Equipement</h3>
            {Object.entries(EQUIPMENT_CATEGORIES).map(([category, items]) => (
          <CategoryAccordion
            key={category}
            category={category}
            items={items}
            selectedEquipment={selectedEquipment}
            onToggleEquipment={onToggleEquipment}
            isOpen={openCategory === category}
            onToggle={() => toggleCategory(category)}
          />
        ))}
          </div>

          {/* Sol */}
          <div className="filter-category">
            <h3 className='h3-panel'>Sol</h3>
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
            <h3 className='h3-panel'>Conditions</h3>
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
function CategoryAccordion({
  category,
  items,
  selectedEquipment,
  onToggleEquipment,
  isOpen,
  onToggle,
}: {
  category: string
  items: string[]
  selectedEquipment: string[]
  onToggleEquipment: (name: string) => void
  isOpen: boolean
  onToggle: () => void
}) {
  const activeCount = items.filter(item => selectedEquipment.includes(item)).length

  return (
    <div className="filter-category">
      <button className="filter-category-header" onClick={onToggle}>
        <span>{category}</span>
        {activeCount > 0 && <span className="filter-category-badge">{activeCount}</span>}
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="filter-category-items">
          {items.map((item) => (
            <label key={item} className="equipment-option">
              <input
                type="checkbox"
                checked={selectedEquipment.includes(item)}
                onChange={() => onToggleEquipment(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}