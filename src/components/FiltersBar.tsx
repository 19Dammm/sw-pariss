type FiltersBarProps = {
  arrondissement: string
  onArrondissementChange: (value: string) => void
  options: string[]
}

export function FiltersBar({
  arrondissement,
  onArrondissementChange,
  options,
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
    </div>
  )
}

