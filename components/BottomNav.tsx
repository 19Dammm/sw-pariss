import { Heart, List, Map, Moon, Navigation, Sun } from 'lucide-react'

type BottomNavProps = {
  mode: 'map' | 'list' | 'favorites'
  theme: 'light' | 'dark'
  onSetMode: (mode: 'map' | 'list' | 'favorites') => void
  onRecenter: () => void
  onToggleTheme: () => void
}

export function BottomNav({ mode, theme, onSetMode, onRecenter, onToggleTheme }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      <button
        type="button"
        data-tooltip="Carte"
        className={`bottom-nav-item${mode === 'map' ? ' bottom-nav-item--active' : ''}`}
        onClick={() => onSetMode('map')}
      >
        <Map size={22} />
        <span className="bottom-nav-label">Carte</span>
      </button>

      <button
        type="button"
        data-tooltip="À proximité"
        className={`bottom-nav-item${mode === 'list' ? ' bottom-nav-item--active' : ''}`}
        onClick={() => onSetMode('list')}
      >
        <List size={22} />
        <span className="bottom-nav-label">À proximité</span>
      </button>

      <button
        type="button"
        data-tooltip="Favoris"
        className={`bottom-nav-item${mode === 'favorites' ? ' bottom-nav-item--active' : ''}`}
        onClick={() => onSetMode('favorites')}
      >
        <Heart size={22} />
        <span className="bottom-nav-label">Favoris</span>
      </button>

      <button
        type="button"
        data-tooltip="Ma position"
        className="bottom-nav-item"
        onClick={onRecenter}
      >
        <Navigation size={22} />
        <span className="bottom-nav-label">Position</span>
      </button>

      <button
        type="button"
        data-tooltip="Thème"
        className="bottom-nav-item"
        onClick={onToggleTheme}
      >
        {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
        <span className="bottom-nav-label">Thème</span>
      </button>
    </nav>
  )
}