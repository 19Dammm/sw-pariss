type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onToggleMode: () => void
  isListMode: boolean
}

export function SearchBar({ value, onChange, onToggleMode, isListMode }: SearchBarProps) {
  return (
    <div className="search-row">
      <div className="top-search">
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Adresse, spot, équipement…"
          aria-label="Rechercher un spot"
        />
        <span className="search-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      </div>
      <button className="mode-toggle" type="button" onClick={onToggleMode}>
        {isListMode ? 'Carte' : 'Liste'}
      </button>
    </div>
  )
}
