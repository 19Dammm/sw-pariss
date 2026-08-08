import { useState } from 'react'
import type { EquipmentOption } from '../lib/equipment'

type EquipementFiltersProps = {
  options: EquipmentOption[]
}

export default function EquipementFilters({ options }: EquipementFiltersProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="equipment-filter">
      <button
        type="button"
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        Équipements
      </button>

      {isMenuOpen && (
        <div className="div-equipement">
          <h4>Équipements</h4>

          {options.map((option) => {
            return (
              <div key={option.name}>
                {option.name} ({option.count})
              </div>
            )
          })}

          <button type="button" className="Equipment-Search-button">
            Rechercher
          </button>
        </div>
      )}
    </div>
  )
}