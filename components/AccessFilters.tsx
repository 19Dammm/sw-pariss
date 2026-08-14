import { ACCESS_FILTER_LABELS, type AccessFilterKey } from '../lib/access'

type AccessFiltersProps = {
  activeFilters: AccessFilterKey[]
  onToggleAccessFilter: (key: AccessFilterKey) => void
}

export function AccessFilters({ activeFilters, onToggleAccessFilter }: AccessFiltersProps) {
  const keys = Object.keys(ACCESS_FILTER_LABELS) as AccessFilterKey[]

  return (
    <div className="access-filters">
      {keys.map((key) => {
        const isActive = activeFilters.includes(key)
        return (
          <button
            key={key}
            type="button"
            className={`access-filter-chip${isActive ? ' access-filter-chip--active' : ''}`}
            onClick={() => onToggleAccessFilter(key)}
            aria-pressed={isActive}
          >
            {ACCESS_FILTER_LABELS[key]}
          </button>
        )
      })}
    </div>
  )
}
