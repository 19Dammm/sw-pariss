import { useState } from 'react'
import type { EquipmentOption } from '../lib/equipment'

type EquipementFiltersProps = {
  options: EquipmentOption[]
  selectedEquipment: string[]
  onToggleEquipment: (equipmentName: string) => void
  onApplyEquipment: () => void
  matchCount: number
}

export default function EquipementFilters({
  options,
  selectedEquipment,
  onToggleEquipment,
  onApplyEquipment,
  matchCount,
}: EquipementFiltersProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleApply = () => {
    onApplyEquipment()
    setIsMenuOpen(false)
  }

  return (
    <div className="equipment-filter">
      <button type="button" className="equipment-filter-trigger" onClick={() => setIsMenuOpen((current) => !current)}>
        Équipements
        {selectedEquipment.length > 0 ? ` (${selectedEquipment.length})` : ''}
      </button>

      {isMenuOpen && (
        <div className="div-equipement">
          <h4>Équipements</h4>

          {options.map((option) => (
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

          <button type="button" className="equipment-search-button" onClick={handleApply}>
            Rechercher ({matchCount})
          </button>
        </div>
      )}
    </div>
  )
}
