import EquipementFilters from './Equipementfilters'
import { AccessFilters } from './AccessFilters'
import type { EquipmentOption } from '../lib/equipment'
import type { AccessFilterKey } from '../lib/access'

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
}: FiltersBarProps) {
  return (
    <div className="filters-bar">
      <label>
        <span>Arrondissement</span>
        <select value={arrondissement} onChange={(event) => onArrondissementChange(event.target.value)}>
          <option value="">Tous</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <EquipementFilters
        options={equipmentOptions}
        selectedEquipment={selectedEquipment}
        onToggleEquipment={onToggleEquipment}
        onApplyEquipment={onApplyEquipment}
        matchCount={equipmentMatchCount}
      />

      <AccessFilters activeFilters={accessFilters} onToggleAccessFilter={onToggleAccessFilter} />
    </div>
  )
}
