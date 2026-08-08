import EquipementFilters from './Equipementfilters' ;
import type { EquipmentOption } from '../lib/equipment'

type FiltersBarProps = {
  arrondissement: string
  onArrondissementChange: (value: string) => void
  options: string[]
  equipmentOptions: EquipmentOption[]
  selectedEquipment: string[]
  onToggleEquipment: (equipmentName: string) => void
}


export function FiltersBar({
  arrondissement,
  onArrondissementChange,
  options,
  equipmentOptions,
  selectedEquipment,
onToggleEquipment,
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
      />
    </div>
  )
}

